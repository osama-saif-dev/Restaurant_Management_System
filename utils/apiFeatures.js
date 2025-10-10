class ApiFeatures {
  constructor(query, queryString) {
    this.query = query; 
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      const keyword = this.queryString.search
        ? {
            name: { $regex: this.queryString.search, $options: "i" },
          }
        : {};
      this.query = this.query.find(keyword);
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ["search", "page", "limit", "sort", "min", "max"];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (this.queryString.min || this.queryString.max) {
      queryObj.price = {};
      if (this.queryString.min) {
        queryObj.price.$gte = Number(this.queryString.min);
      }
      if (this.queryString.max) {
        queryObj.price.$lte = Number(this.queryString.max);
      }
      console.log("Price filter:", queryObj.price); 
    }

    if (this.queryString.sizes) {
      const sizesArray = this.queryString.sizes.split(",");
      queryObj.sizes = { $in: sizesArray };
    }

    if (this.queryString.subcategory) {
      queryObj.subcategoryId = this.queryString.subcategory;
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
}

export default ApiFeatures;
