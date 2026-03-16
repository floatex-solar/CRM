import { Request, Response } from "express";
import type { PipelineStage } from "mongoose";
import { CompanyModel } from "../models/company.model.js";
import { LeadModel } from "../models/lead.model.js";
import { SiteModel } from "../models/site.model.js";
import { TaskModel } from "../models/task.model.js";
import catchAsync from "../utils/catchAsync.js";
import type {
  DashboardStats,
  CompanyStats,
  LeadStats,
  SiteStats,
  TaskStats,
} from "../types/dashboard.types.js";

/**
 * Converts an array of { _id: string, count: number } into a Record<string, number>.
 */
function toRecord(
  arr: Array<{ _id: string | null; count: number }>,
): Record<string, number> {
  const record: Record<string, number> = {};
  for (const item of arr) {
    if (item._id) {
      record[item._id] = item.count;
    }
  }
  return record;
}

/**
 * Builds a createdAt date range filter from query params.
 */
function buildDateMatch(
  from?: string,
  to?: string,
): PipelineStage.Match | null {
  if (!from && !to) return null;
  const filter: Record<string, Date> = {};
  if (from) filter.$gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    filter.$lte = toDate;
  }
  return { $match: { createdAt: filter } };
}

/**
 * Aggregates company stats using MongoDB $facet pipeline.
 */
async function getCompanyStats(
  dateMatch: PipelineStage.Match | null,
): Promise<CompanyStats> {
  const pipeline: PipelineStage[] = [];
  if (dateMatch) pipeline.push(dateMatch);

  pipeline.push({
    $facet: {
      total: [{ $count: "count" }],
      byLeadStatus: [
        { $group: { _id: "$leadStatus", count: { $sum: 1 } } },
      ],
      byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
      byLeadSource: [
        { $match: { leadSource: { $nin: [null, ""] } } },
        { $group: { _id: "$leadSource", count: { $sum: 1 } } },
      ],
      ndaSigned: [{ $match: { ndaStatus: "Signed" } }, { $count: "count" }],
      ndaPending: [
        { $match: { ndaStatus: { $in: ["Not Sent", "Sent"] } } },
        { $count: "count" },
      ],
      ndaExpired: [{ $match: { ndaStatus: "Expired" } }, { $count: "count" }],
      mouSigned: [{ $match: { mouStatus: "Signed" } }, { $count: "count" }],
      mouPending: [
        { $match: { mouStatus: { $in: ["Not Sent", "Sent"] } } },
        { $count: "count" },
      ],
      mouExpired: [
        { $match: { mouStatus: "Expired" } },
        { $count: "count" },
      ],
      emailSent: [{ $match: { emailSent: "Yes" } }, { $count: "count" }],
      emailPending: [
        {
          $match: {
            $or: [{ emailSent: "No" }, { emailSent: { $exists: false } }],
          },
        },
        { $count: "count" },
      ],
    },
  });

  const [result] = await CompanyModel.aggregate(pipeline);

  return {
    total: result.total[0]?.count ?? 0,
    byLeadStatus: toRecord(result.byLeadStatus),
    byPriority: toRecord(result.byPriority),
    byLeadSource: toRecord(result.byLeadSource),
    ndaSigned: result.ndaSigned[0]?.count ?? 0,
    ndaPending: result.ndaPending[0]?.count ?? 0,
    ndaExpired: result.ndaExpired[0]?.count ?? 0,
    mouSigned: result.mouSigned[0]?.count ?? 0,
    mouPending: result.mouPending[0]?.count ?? 0,
    mouExpired: result.mouExpired[0]?.count ?? 0,
    emailSent: result.emailSent[0]?.count ?? 0,
    emailPending: result.emailPending[0]?.count ?? 0,
  };
}

/**
 * Aggregates lead stats using MongoDB $facet pipeline.
 */
async function getLeadStats(
  dateMatch: PipelineStage.Match | null,
): Promise<LeadStats> {
  const pipeline: PipelineStage[] = [];
  if (dateMatch) pipeline.push(dateMatch);

  pipeline.push({
    $facet: {
      total: [{ $count: "count" }],
      byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
    },
  });

  const [result] = await LeadModel.aggregate(pipeline);

  return {
    total: result.total[0]?.count ?? 0,
    byPriority: toRecord(result.byPriority),
  };
}

/**
 * Aggregates site stats using MongoDB $facet pipeline.
 */
async function getSiteStats(
  dateMatch: PipelineStage.Match | null,
): Promise<SiteStats> {
  const pipeline: PipelineStage[] = [];
  if (dateMatch) pipeline.push(dateMatch);

  pipeline.push({
    $facet: {
      total: [{ $count: "count" }],
      pondGettingEmpty: [
        { $match: { possibilityForPondGettingEmpty: true } },
        { $count: "count" },
      ],
      bathymetryNotAvailable: [
        { $match: { bathymetryAvailable: false } },
        { $count: "count" },
      ],
      dprNotAvailable: [
        { $match: { dprAvailable: false } },
        { $count: "count" },
      ],
      geotechnicalNotAvailable: [
        { $match: { geotechnicalReportAvailable: false } },
        { $count: "count" },
      ],
      pfrNotAvailable: [
        { $match: { pfrAvailable: false } },
        { $count: "count" },
      ],
    },
  });

  const [result] = await SiteModel.aggregate(pipeline);

  return {
    total: result.total[0]?.count ?? 0,
    pondGettingEmpty: result.pondGettingEmpty[0]?.count ?? 0,
    bathymetryNotAvailable: result.bathymetryNotAvailable[0]?.count ?? 0,
    dprNotAvailable: result.dprNotAvailable[0]?.count ?? 0,
    geotechnicalNotAvailable: result.geotechnicalNotAvailable[0]?.count ?? 0,
    pfrNotAvailable: result.pfrNotAvailable[0]?.count ?? 0,
  };
}

/**
 * Aggregates task stats using MongoDB $facet pipeline.
 */
async function getTaskStats(
  dateMatch: PipelineStage.Match | null,
): Promise<TaskStats> {
  const pipeline: PipelineStage[] = [];
  if (dateMatch) pipeline.push(dateMatch);

  pipeline.push({
    $facet: {
      total: [{ $count: "count" }],
      byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      byPriority: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
    },
  });

  const [result] = await TaskModel.aggregate(pipeline);

  return {
    total: result.total[0]?.count ?? 0,
    byStatus: toRecord(result.byStatus),
    byPriority: toRecord(result.byPriority),
  };
}

/* =========================================================
   Dashboard Stats Endpoint
========================================================= */

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    // Global date range
    const globalMatch = buildDateMatch(from, to);

    // Per-section date filters (override global if provided)
    const companiesMatch = buildDateMatch(
      (req.query.companiesFrom as string) ?? from,
      (req.query.companiesTo as string) ?? to,
    );
    const leadsMatch = buildDateMatch(
      (req.query.leadsFrom as string) ?? from,
      (req.query.leadsTo as string) ?? to,
    );
    const sitesMatch = buildDateMatch(
      (req.query.sitesFrom as string) ?? from,
      (req.query.sitesTo as string) ?? to,
    );
    const tasksMatch = buildDateMatch(
      (req.query.tasksFrom as string) ?? from,
      (req.query.tasksTo as string) ?? to,
    );

    const [companies, leads, sites, tasks] = await Promise.all([
      getCompanyStats(companiesMatch ?? globalMatch),
      getLeadStats(leadsMatch ?? globalMatch),
      getSiteStats(sitesMatch ?? globalMatch),
      getTaskStats(tasksMatch ?? globalMatch),
    ]);

    const stats: DashboardStats = { companies, leads, sites, tasks };

    res.status(200).json({
      status: "success",
      data: stats,
    });
  },
);
