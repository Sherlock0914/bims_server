var express = require('express');
var router = express.Router();
var BRP = require('../Controller/BRP')

router.get(`/:KPI/:Location`, function (req, res) {
	let site = req.query.site, //P2,P3,P4
		kpi = req.params.KPI //All、RE_BRP,FPY,Port_yield ...
	    location = req.params.Location //KS,CQ,CD
	if (kpi === "All")
		return BRP.getAllDPM(location, site)
			.then(data => res.json(data))
			.catch(err => {
				return res.status(500).send(err.message);
			})
	else
		return res.json(BRP.getTest())
})

module.exports = router