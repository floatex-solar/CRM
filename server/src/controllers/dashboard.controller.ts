import { Request, Response } from "express";
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
function toRecord(arr: Array<{ _id: string | null; count: number }>): Record<string, number> {
  const record: Record<string, number> = {};
  for (const item of arr) {
    if (item._id) {
      record[item._id] = item.count;
    }
  }
  return record;
}

/**
 * Aggregates company stats using MongoDB $facet pipeline.
 */
async function getCompanyStats(): Promise<CompanyStats> {
  const [result] = await CompanyModel.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byLeadStatus: [
          { $group: { _id: "$leadStatus", count: { $sum: 1 } } },
        ],
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
        byLeadSource: [
          { $match: { leadSource: { $nin: [null, ""] } } },
          { $group: { _id: "$leadSource", count: { $sum: 1 } } },
        ],
        ndaSigned: [
          { $match: { ndaStatus: "Signed" } },
          { $count: "count" },
        ],
        ndaPending: [
          { $match: { ndaStatus: { $in: ["Not Sent", "Sent"] } } },
          { $count: "count" },
        ],
        ndaExpired: [
          { $match: { ndaStatus: "Expired" } },
          { $count: "count" },
        ],
        mouSigned: [
          { $match: { mouStatus: "Signed" } },
          { $count: "count" },
        ],
        mouPending: [
          { $match: { mouStatus: { $in: ["Not Sent", "Sent"] } } },
          { $count: "count" },
        ],
        mouExpired: [
          { $match: { mouStatus: "Expired" } },
          { $count: "count" },
        ],
        emailSent: [
          { $match: { emailSent: "Yes" } },
          { $count: "count" },
        ],
        emailPending: [
          { $match: { $or: [{ emailSent: "No" }, { emailSent: { $exists: false } }] } },
          { $count: "count" },
        ],
      },
    },
  ]);

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
async function getLeadStats(): Promise<LeadStats> {
  const [result] = await LeadModel.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  return {
    total: result.total[0]?.count ?? 0,
    byPriority: toRecord(result.byPriority),
  };
}

/**
 * Aggregates site stats using MongoDB $facet pipeline.
 */
async function getSiteStats(): Promise<SiteStats> {
  const [result] = await SiteModel.aggregate([
    {
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
    },
  ]);

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
async function getTaskStats(): Promise<TaskStats> {
  const [result] = await TaskModel.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ],
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ],
      },
    },
  ]);

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
  async (_req: Request, res: Response) => {
    const [companies, leads, sites, tasks] = await Promise.all([
      getCompanyStats(),
      getLeadStats(),
      getSiteStats(),
      getTaskStats(),
    ]);

    const stats: DashboardStats = { companies, leads, sites, tasks };

    res.status(200).json({
      status: "success",
      data: stats,
    });
  },
);
