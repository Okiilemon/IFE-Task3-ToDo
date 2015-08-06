/*
  * 管理数据增删改查的对象
  * 说明：
  * 在这个应用中，有两张表
  * 一个是分类列表folder表，一个是任务task表
  * 一个localStorage项存储一个表
  * 每张表是一个对象数组，数组每一项就是一个folder、task对象，用来存储每一项的相关信息
  * toDoStorage {
    //有5个方法
      getItemListArray()
      getItem()
      addItem()
      setItem()
      removeItem()
    }
*/
var toDoStorage = {};

/*
 * 获取type对应的 localStorage value,也就是储存 folder 或者 task 的数组对象
*/
toDoStorage.getItemListArray = function (type) {

  var itemListArray = JSON.parse(localStorage.getItem(type));
  //如果还没有值，初始化为一个数组
  return itemListArray ? itemListArray : [];

};

/*
  * 通过一对key&value 获得 key === value 的这个对象
  * 参数说明：
  * type: folder 或者 task
  * key: folder 或者 task 的某一项属性
  * value: 所要匹配的属性值
*/
toDoStorage.getItem = function (type, key, value) {

  var itemListArray = this.getItemListArray(type);
  var len = itemListArray.length,
    i;
  if (!len) return;
  for (i = 0; i < len; i++) {
    if (itemListArray[i][key] === value) {
      return itemListArray[i];
    }
  }

};

/*
  * 新增某一项的方法
  * 参数说明
  * type: folder 或者 task
  * itemObj: 新添的哈希列表对象 一个folder或task的信息对象
*/
toDoStorage.addItem = function (type, itemObj) {

  var itemListArray = this.getItemListArray(type);
  itemListArray.push(itemObj);
  localStorage.setItem(type, JSON.stringify(itemListArray));

};

/*
  * 修改某一项某个属性的方法，因为value是一个数组对象，修改起来很不方便，需要封装成一个方法
  * 参数说明：
  * type: folder 或者 task
  * idValue: folder 或者 task 的唯一标示符
  * options: 一个哈希列表
  { item: value } item是要修改的项，value是新的值
*/
toDoStorage.setItem = function (type, idValue, options) {
  var id = type === 'folder' ? 'name' : 'taskID';
  var itemListArray = this.getItemListArray(type),
      len = itemListArray.length,
      i, j;
  if (!len) return;

  for (i = 0; i < len; i++) {
    if (itemListArray[i][id] === idValue) {
      for (j in options) {
        if (options.hasOwnProperty(j)) {
          itemListArray[i][j] = options[j];
        }
      }
      break;
    }
  }
  localStorage.setItem(type, JSON.stringify(itemListArray));

};

/*
  * 根据条件 key === value 删除某一项 folder 或者 task 符合条件的item 的方法
  * @param:
  * type: {string} 'folder' 或 'task'
  * key: 属性名
  * value: 值
*/
toDoStorage.removeItem = function (type, key, value) {

  var itemListArray = this.getItemListArray(type);
  var len = itemListArray.length,
      i;
  if (!len) return;
  for (i = 0; i < len; i++) {
    if (itemListArray[i][key] === value) {
      itemListArray.splice(i, 1);
      break;
    }
  }
  localStorage.setItem(type, JSON.stringify(itemListArray));

};
