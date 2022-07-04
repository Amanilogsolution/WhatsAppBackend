const express = require('express');
const app = express();
const port = 8009
const sql = require('mssql')
const sqlConfig = require('./config/config')
const os = require('os')
const { default: axios } = require("axios")
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.post('/insertwhatsapp', async function (req, res){
    const datas = req.body.datas;
    const message = req.body.message;
    const message_id = req.body.message_id;
    console.log(datas,message,message_id)
    try {
        await sql.connect(sqlConfig)
        const result1 = await sql.query(`INSERT into  AWLFINS.dbo.tbl_message (image_url,message,message_id,entryby_system,entry_date)
        values('Url','${message}','${message_id}','${os.hostname()}',getdate())`)
        const result = await sql.query(`INSERT into AWLFINS.dbo.tbl_whatsapp_data (phone_no,message_id,entryby_system,entry_date)
        VALUES ${datas.map(item => `('${item.phone_no}','${message_id}','${os.hostname()}',getDate())`)}`)
     
        console.log(result1.rowsAffected[0]) 
        res.send("Added")
    }
    catch (err) {
        console.log(err)
    }
})

app.get('/getlastid',async function (req,res){
    try {
        await sql.connect(sqlConfig)
        const result = await sql.query(`select top 1 message_id from AWLFINS.dbo.tbl_message with (nolock) order by sno desc;`)
       console.log(result.recordset[0])
        res.send(result.recordset[0])
    }
    catch (err) {
        res.send(err)
    }
} 
)

app.post('/sendmessage',async function (req,res){
    const data = req.body.data;
    const text = req.body.message;
    console.log("Yoo",data,text)
    try{
        data.map((item)=>{
            axios.post(`http://192.168.146.19:3000/91${item.phone_no}/sendText/`,{text})
            .then(response=>response.data)
            .catch(error => console.log(error))
        })
        res.send("Message Send")
    }
    catch (err) {
        console.log(err)
    }
})

app.listen(port, (err, req, res, next) => {
    if (err)
      console.log("Ouch! Something went wrong")
    console.log(`server listen on: ${port}`)
  })