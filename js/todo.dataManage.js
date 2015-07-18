/*
  * 管理数据增删改查的对象
  * 说明：
  * 在这个应用中，有两张表
  * 一个是分类列表folder表，一个是任务task表
  * 一个localStorage存储一个表
  * 每张表是一个对象数组，数组每一项就是一个folder、task对象，用来存储每一项的相关信息
*/
var toDoStorage = {};

/*
 * 获取key对应的 localStorage value,也就是储存 folder 或者 task 的数组对象
*/
toDoStorage.getItemListArray = function (key) {

  var itemListArray = JSON.parse(localStorage.getItem(key));
  //如果还没有值，初始化为一个数组
  return itemListArray ? itemListArray : [];

};

/*
  * 查找某一项属性值的方法
  * 参数说明：
  * key: folder 或者 task
  * itemKey: folder 或者 task 的某一项属性
*/
toDoStorage.getItem = function (key, name, itemKey) {

  var itemListArray = this.getItemListArray(key);
  var len = itemListArray.length,
    i;
  if (!len) return;
  for (i = 0; i < len; i++) {
    if (itemListArray[i]['name'] === name) {
      return itemListArray[i][itemKey];
    }
  }

};

/*
  * 新增某一项的方法
  * 参数说明
  * key: folder 或者 task
  * itemObj: 新添的哈希列表对象 一个folder或task的信息对象
*/
toDoStorage.addItem = function (key, itemObj) {

  var itemListArray = this.getItemListArray(key);
  itemListArray.push(itemObj)
  localStorage.setItem(key, JSON.stringify(itemListArray));

};

/*
  * 修改某一项某个属性的方法，因为value是一个数组对象，修改起来很不方便，需要封装成一个方法
  * 参数说明：
  * key: folder 或者 task 
  * name: folder 或者 task 的名字
  * options: 一个哈希列表
  { item: value } item是要修改的项，value是新的值
*/
toDoStorage.setItem = function (key, name, options) {

  var itemListArray = this.getItemListArray(key),
      len = itemListArray.length,
      i, j;
  if (!len) return;

  for (i = 0; i < len; i++) {
    if (itemListArray[i].name === name) {
      for (j in options) {
        if (options.hasOwnProperty(j)) {
          itemListArray[i][j] = options[j];
        }
      }
      break;
    }
  }
  localStorage.setItem(key, JSON.stringify(itemListArray))

};

/*
  * 删除某一项 folder 或者 task item 的方法
*/
toDoStorage.removeItem = function (key, name) {
  
  var itemListArray = this.getItemListArray(key);
  var len = itemListArray.length,
      i;
  if (!len) return;
  for (i = 0; i < len; i++) {
    if (itemListArray[i]['name'] === name) {
      itemListArray.splice(i, 1);
    }
    break;
  }
  localStorage.setItem(key, JSON.stringify(itemListArray))
  
};




