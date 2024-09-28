export const deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No document found with the given id",
        });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.msg || "Internal server error",
    });
  }
};

export const updateOne = (Model) => async (req, res, next) => {
  try {
    if (req.body.password) {
      req.body.password = undefined;
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No document found with the given id",
        });
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.msg || "Internal server error",
    });
  }
};

export const createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.msg || "Internal server error",
    });
  }
};

export const getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No document found with the given id",
        });
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.msg || "Internal server error",
    });
  }
};

export const getAll = (Model) => async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.chatId) filter = { chatId: req.query.chatId };
    const doc = await Model.find(filter);
    res.status(200).json({
      status: "success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.msg || "Internal server error",
    });
  }
};
