const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
const db = mysql.createConnection(
  {
    host:"localhost", port : 3306, user :"root", password: "0201123rR$", database:"bamazon"
  }
);

db.connect((err) =>{
  if(err)throw err;
  start();
});

const start = () =>{
  let itemFetcher = new Promise((resolve, reject) => {
    db.query("SELECT * FROM products",(err,data)=>{
      if(err){
        reject(new Error(err));
      } 
    
      let items = [];
      for(let i=0;i< data.length;i++)
      {
        var itemData = {
          name : data[i].product_name + ", $" + data[i].price + ", Available: "+ data[i].stock_quantity,
          value : {
            item_id:data[i].item_id,
            product_name: data[i].product_name,
            department_name: data[i].department_name,
            price: data[i].price,
            stock_quantity: data[i].stock_quantity
          }
        }

        items.push(itemData);
        resolve(items);
      }
    });  
});

itemFetcher.then((items) => {
    inquirer.prompt([
        {
          type: 'list',
          message: 'Choose an item to Buy:',
          choices: items,
          name: "item"
      },{
        name:"quantity",
        message:"Enter Quantity:",
        validate :function(input){
          return !isNaN(input);
        } 
      }]).then(function(pick) {
        
        if(pick.item.stock_quantity < pick.quantity){
          console.log("Insufficient Quantity!");
        }else{
          let quantity = pick.item.stock_quantity - pick.quantity;
          let cost = pick.quantity * pick.item.price;
          updateProducts(quantity, pick.item.item_id, cost);
        }
    });
});

itemFetcher.catch((err)=>{
  console.log(err);
});
}
  
const updateProducts = (quantity,item_id,cost) =>{
  const uWhere = {item_id};
  const uSet = {stock_quantity:quantity};
  const uQuery = "UPDATE products SET ? WHERE ?";
  const query = db.query(uQuery, [uSet,uWhere], function(err,updatedProductDb){
     if(err) throw err;
     console.log(query.sql);
     console.log(`${updatedProductDb.affectedRows} Product items updated!`);
     console.log('Your Total Price : ' + cost);
     start();
   } )
}

