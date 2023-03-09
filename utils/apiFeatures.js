class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    // or we can do --> Tour.find().find(JSON.parse(queryStr))

    return this; 
  } //filter closed

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  } //sort closed

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join('  ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-_v');
    }

    return this;
  } //limitFields closed

  paginate() {
    const page = this.queryString.page * 1 || 1;

    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  } //Pagination clsoed
} //API class closed

module.exports = APIFeatures;
