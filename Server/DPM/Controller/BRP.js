var mysql = require('Promise-mysql')
var moment = require(`moment`)
var config = require(`../../../config`)
var _ = require('lodash')
var Q = require('q')
moment.locale('zh_cn')

var gConnect, gPool
function getTest() {
    return {
        port_yield: 91.99,
        port_util: 92.99,
        re_brp: 93.99,
        on_target_day: 94.99,
        on_target_week: 95.99,
        on_target_month: 96.99,
        fpy_day: 97.99,
        fpy_week: 98.99,
        fpy_month: 99.99
    }
}

function getConnection() {
    gConnect = null
    if (gPool) return gPool.getConnection()
        .then((connection) => {
            gConnect = connection
            return connection
        })
        .catch(err => {
            throw err
        })
    else
        return mysql.createPool(config.database)
            .then(pool => {
                gPool = pool
                return pool.getConnection()
            })
            .then((connection) => {
                gConnect = connection
                return connection
            })
            .catch(err => {
                throw err
            })
}


function getAllDPM(location,site) {
    let ts = new Date(), start_ts, w_start_ts, m_start_ts, sdate
    let pre_ts = new Date(ts.getTime() - 24 * 60 * 60 * 1000);
    let mts = moment(ts).format(`H:mm:ss`).split(":")
    sdate = new Date(moment(ts).format("YYYY/MM/DD"))
    let hr = mts[0]
    if (hr >= 8 && hr < 20) {
        shift = "D"
        start_ts = new Date(moment(ts).add(-10, 'day').format("YYYY/MM/DD") + " 08:00:00")
    }
    else {
        shift = "N"
        if (hr < 8)
            start_ts = new Date(moment(pre_ts).format("YYYY/MM/DD") + " 20:00:00")
        else
            start_ts = new Date(moment(ts).format("YYYY/MM/DD") + " 20:00:00")
    }
    w_start_ts = moment().startOf('week')._d
    m_start_ts = moment().startOf('month')._d

    var _sql = `select runin_in_cnt,swdl_in_cnt, on_target from brp_summery_by_swdl 
                where total_interval is not null and last_swdl_time >= ? and last_swdl_time < ? and location =? and plant =?`
    var fpy_d_sql, fpy_w_sql, fpy_m_sql, fpy_d_param, fpy_w_param, fpy_m_param
    fpy_d_sql = `select sum(total_fail_qty) fail_qty,sum(swdl_pass_qty) pass_qty from fpy_hist where fpy_date =? and shift =? and location =? and plant =?`
    fpy_d_param = [sdate, shift, location, site]
    fpy_w_sql = `select sum(total_fail_qty) fail_qty,sum(swdl_pass_qty) pass_qty from fpy_hist where fpy_year = ? and fpy_week =? and location =? and plant =?`
    fpy_w_param = [moment(ts).year(), moment(ts).week(),location, site]
    fpy_m_sql = `select sum(total_fail_qty) fail_qty,sum(swdl_pass_qty) pass_qty from fpy_hist where fpy_year = ? and fpy_month =? and location =? and plant =?`
    fpy_m_param = [moment(ts).year(), moment(ts).month() + 1, location, site]
    var qrys = [
        { sql: _sql, param: [start_ts, ts, location, site] },
        { sql: _sql, param: [w_start_ts, ts,location, site] },
        { sql: _sql, param: [m_start_ts, ts,location, site] },
        { sql: fpy_d_sql, param: fpy_d_param },
        { sql: fpy_w_sql, param: fpy_w_param },
        { sql: fpy_m_sql, param: fpy_m_param }
    ]
    var data = {
        //wait for port util table enabled
        port_yield: 91.22,
        port_util: 92.22
    }
    return getConnection()
        .then(con => {
            return Q.all(_.map(qrys, val => {
                return con.query(val.sql, val.param)
            }))
                .then((result) => {
                    var dRows = result[0], wRows = result[1], mRows = result[2],
                        dRowsFpy = result[3], wRowsFpy = result[4], mRowsFpy = result[5]

                    var re_brp = 0, d_on_target = 0, w_on_target = 0, m_on_target = 0
                    if (!dRows.length) data.re_brp = 0
                    else {
                        dRows.forEach(row => {
                            if (row.runin_in_cnt > 1 || row.swdl_in_cnt > 1) re_brp++;
                            if (row.on_target) d_on_target++
                        })
                        data.re_brp = ((re_brp / dRows.length) * 100).toFixed(2)
                        data.on_target_day = ((d_on_target / dRows.length) * 100).toFixed(2)
                    }
                    if (!wRows.length) data.on_target_week = 0
                    else {
                        wRows.forEach(row => {
                            if (row.on_target) w_on_target++
                        })
                        data.on_target_week = ((w_on_target / wRows.length) * 100).toFixed(2)
                    }
                    if (!mRows.length) data.on_target_month = 0
                    else {
                        mRows.forEach(row => {
                            if (row.on_target) m_on_target++
                        })
                        data.on_target_month = ((m_on_target / mRows.length) * 100).toFixed(2)
                    }
                    if (!dRowsFpy.length)
                        data.fpy_day = 0
                    else {
                        let fail_qty = dRowsFpy[0].fail_qty || 0,
                            pass_qty = dRowsFpy[0].pass_qty || 0
                        if (fail_qty === 0 && pass_qty === 0) data.fpy_day = 0
                        else
                            data.fpy_day = ((pass_qty / (fail_qty + pass_qty)) * 100).toFixed(2)
                    }

                    if (!wRowsFpy.length)
                        data.fpy_week = 0
                    else {
                        let fail_qty = wRowsFpy[0].fail_qty || 0,
                            pass_qty = wRowsFpy[0].pass_qty || 0
                        if (fail_qty === 0 && pass_qty === 0)
                            data.fpy_week = 0
                        else
                            data.fpy_week = ((pass_qty / (fail_qty + pass_qty)) * 100).toFixed(2)
                    }

                    if (!mRowsFpy.length)
                        data.fpy_month = 0
                    else {
                        let fail_qty = mRowsFpy[0].fail_qty || 0,
                            pass_qty = mRowsFpy[0].pass_qty || 0
                        if (fail_qty === 0 && pass_qty === 0)
                            data.fpy_month = 0
                        else
                            data.fpy_month = ((pass_qty / (fail_qty + pass_qty)) * 100).toFixed(2)
                    }
                })

        })
        .then(() => data)
        .catch(err => {
            throw err
        })

}
module.exports = { getTest, getAllDPM }