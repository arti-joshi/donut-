
const routes = require('express').Router();
const controller = require('../controller/controller');

routes.route('/api/kinds')
  .post(controller.create_types)
  .get(controller.get_types)
  .delete(controller.delete_all_types);


routes.route('/api/transactions')
  .post(controller.create_transaction)
  .get(controller.get_transactions)
  .delete(controller.delete_transaction);

// Route for dashboard data
routes.route('/api/dashboard')
  .get(controller.get_dashboard_data);

routes.route('/api/labels')
  .get(controller.get_Labels);

  // Route to fetch transaction by uid
routes.route("/api/get-transaction/:uid")
 .get(controller.get_transaction_by_uid);



module.exports = routes;