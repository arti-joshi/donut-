const model = require("../models/model");

// Predefined colors for types that affect the chart
const typeColors = {
  Expense: "#FF5733", // Red for expenses
  Savings: "#28B463", // Green for savings
};

// POST: http://localhost:8080/api/categories
async function create_types(req, res) {
  try {
    const types = [
      { type: "Expense", color: "#FF4E88" }, // Correct color for Expense
      { type: "Savings", color: "#28B463" }, // Correct color for Savings
    ];

    const savedTypes = await model.Types.insertMany(types);
    res.json(savedTypes);
  } catch (err) {
    return res
      .status(400)
      .json({ message: `Error while creating types: ${err.message}` });
  }
}

// get: http://localhost:8080/api/types
async function get_types(req, res) {
  let data = await model.Types.find({});

  let filter = await data.map((v) =>
    Object.assign({}, { type: v.type, color: v.color })
  );
  return res.json(filter);
}

// DELETE: http://localhost:8080/api/kinds
async function delete_all_types(req, res) {
  try {
    const result = await model.types.deleteMany({});
    res.json({
      message: "All types deleted!",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error while deleting types: ${err.message}` });
  }
}

// POST: Create a new transaction
async function create_transaction(req, res) {
  try {
    const { name, category, type, amount, date_time } = req.body;

    const newTransaction = new model.Transaction({
      name,
      category,
      type,
      amount,
      date_time,
    });
    const savedTransaction = await newTransaction.save();
    res.json(savedTransaction);
  } catch (err) {
    return res
      .status(400)
      .json({ message: `Error while creating transaction: ${err.message}` });
  }
}

// GET: Retrieve all transactions
async function get_transactions(req, res) {
  try {
    const transactions = await model.Transaction.find({});
    res.json(transactions);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error while fetching transactions: ${err.message}` });
  }
}

// GET: http://localhost:8080/api/get-transaction/:uid
async function get_transaction_by_uid(req, res) {
  try {
    const { uid } = req.params;
    const transaction = await model.Transaction.findOne({ _id: uid });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error while fetching transaction: ${err.message}` });
  }
}

// DELETE: http://localhost:8080/api/dashboard
async function delete_transaction(req, res) {
  if (!req.body)
    return res.status(400).json({ message: "Request body not Found" });

  try {
    const result = await model.Transaction.deleteOne(req.body);
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No transaction found to delete" });
    }
    res.json({ message: "Record Deleted!" });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error while deleting Transaction Record: " + err.message,
      });
  }
}

// GET: http://localhost:8080/api/dashboard
// Get data for the dashboard chart
async function get_dashboard_data(req, res) {
  try {
    const transactions = await model.Transaction.find();
    const data = {
      expenses: transactions
        .filter((t) => t.kind === "Expense")
        .reduce((acc, curr) => acc + curr.amount, 0),
      savings: transactions
        .filter((t) => t.kind === "Savings")
        .reduce((acc, curr) => acc + curr.amount, 0),
      investments: transactions
        .filter((t) => t.kind === "Investment")
        .reduce((acc, curr) => acc + curr.amount, 0),
    };
    res.status(200).json(data);
  } catch (err) {
    res
      .status(400)
      .json({ message: `Error while fetching dashboard data: ${err}` });
  }
}

// GET: http://localhost:8080/api/labels
async function get_Labels(req, res) {
  model.Transaction.aggregate([
    {
      $lookup: {
        from: "categories", // The name of the Categories collection
        localField: "type", // Field from the Transaction collection
        foreignField: "type", // Field from the Categories collection
        as: "types_info", // Output array field
      },
    },
    { $unwind: "$types_info" }, // Deconstructs the type_info array field
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        category: { $first: "$category" },
        type: { $first: "$type" },
        amount: { $first: "$amount" },
        date_time: { $first: "$date_time" },
        types_info: { $first: "$types_info" }, // Assuming we want the first matching type info
      },
    },
  ])
    .then((result) => {
      let data = result.map((v) =>
        Object.assign(
          {},
          {
            _id: v._id,
            name: v.name,
            type: v.type,
            amount: v.amount,
            color: v.types_info["color"],
          }
        )
      ); //in order to the necessary data only and remove unnecessary
      res.json(data);
    })
    .catch((error) => {
      res.status(400).json({ message: `Lookup Collection Error: ${error}` });
    });
}

module.exports = {
  create_transaction, // For handling transaction creation
  get_transactions, // For fetching transactions
  delete_transaction,
  get_dashboard_data,
  create_types,
  get_types,
  get_Labels,
  delete_all_types,
  get_transaction_by_uid,
};
