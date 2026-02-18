import { Query } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;

  // Allow extra dynamic query params like price, duration, etc.
  [key: string]: any;
}

export default class APIFeatures<T> {
  query: Query<T[], T>;
  queryStr: QueryString;

  constructor(query: Query<T[], T>, queryStr: QueryString) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // ✅ Filtering
  filter() {
    const queryObj = { ...this.queryStr };

    // Remove special fields
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Convert array values to MongoDB $in operator for faceted filtering
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(queryObj)) {
      if (Array.isArray(value)) {
        processed[key] = { $in: value };
      } else {
        processed[key] = value;
      }
    }

    // Convert operators to MongoDB format ($gte, $gt...)
    let queryStr = JSON.stringify(processed);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Apply filtering
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // ✅ Sorting
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  // ✅ Field Limiting (Projection)
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  // ✅ Pagination
  paginate() {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
