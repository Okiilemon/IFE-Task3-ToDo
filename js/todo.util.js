
//每个item或者task的高度
var height_per_item = 29;

/*
* 控制下拉列表动画
*/
var dropDownList = function (taskFolder) {

  var taskItems = taskFolder.querySelector('.task-items-box');
  var num_of_items = taskItems.querySelectorAll('li').length;
  var open_folder_icon = taskFolder.querySelector('.fa-folder-open-o');
  var close_folder_icon = taskFolder.querySelector('.fa-folder');
  var is_opened = taskItems.getAttribute('data-is-opened');
  if (is_opened == 'true') {
    taskItems.style.maxHeight = '';
    close_folder_icon.style.display = 'inline';
    open_folder_icon.style.display = 'none';
    taskItems.setAttribute('data-is-opened', 'false');
  }
  else {
    taskItems.style.maxHeight = num_of_items * height_per_item + 'px';
    close_folder_icon.style.display = 'none';
    open_folder_icon.style.display = 'inline';
    taskItems.setAttribute('data-is-opened', 'true');
  }

};
    
/*
 * 动态地去增加或减少列表树中自身以及父节点的高度，
 * 否则新增加的节点不能立即动态地显示在页面中，
 * 会由于父节点的overflow:hidden而遮盖掉
 * @param:
 * changeType: {bool} true 为增加高度， false 为减少高度
 * newNode: {obj} 新添加的节点
*/
var changeHeightOfItemsBox = function (changeType, newNode) {
  var item_boxes = document.querySelectorAll('.task-items-box');
  var lenOfFolders = item_boxes.length;
  var i;

  for (i = 0; i < lenOfFolders; i++) {
    if (item_boxes[i].contains(newNode)) {
      var current_Box_Height = parseInt(window.getComputedStyle(item_boxes[i], null).getPropertyValue('max-height'));
      if (changeType) {
        item_boxes[i].style.maxHeight = current_Box_Height + height_per_item + 'px';
      }
      else {
        item_boxes[i].style.maxHeight = current_Box_Height - height_per_item + 'px';
      }
    }
  }
};

/*
 * 渲染单个分类列表节点方法
 * @param:
 * name:{string} 新写入的这个分类列表的名字
 * parentFolderID: {string} 上一级分类文件夹的唯一标示符（文件夹的名字）
 * num: {number} 这个分类列表下任务的个数
 * level: {number} 这个分类列表在嵌套列表树中所处的层级     
 * 
*/
var paintFolderNode = function (name, parentFolder, num, level) {

  //创建待添加的新分类节点
  var toBeAddedFolder = document.createElement('li');
  //toBeAddedFolder.setAttribute('data-has-child','false');
  toBeAddedFolder.className = 'task-folder';
  var folder_tmpl =
    '<div class="folder-name-box" data-folder-selected="false" data-tree-level=' + level + '>'
    + '<i class="fa fa-folder"></i>'
    + '<i class="fa fa-folder-open-o"></i>'
    + '<span class="folder-name">' + name + '</span>'
    + '  (<span class="task-num">' + num + '</span>)'
    + '<i class="fa fa-close"></i>'
    + '</div>'
    + '<ul class="task-items-box" data-is-opened="false" data-folder-id=' + name + '></ul>';
  //插入DOM
  toBeAddedFolder.innerHTML = folder_tmpl;
  parentFolder.appendChild(toBeAddedFolder);

  changeHeightOfItemsBox(true, toBeAddedFolder);

}

/* 
 * 渲染任务节点的方法
 * @param:
 * name: {string} 任务名称
 * ddl: {obj Date()} 任务截止日期
 * parentFolder: {obj node} 父分类文件夹节点
 * state: {bool} 任务完成与否的标志 true 为已完成
*/
var paintTaskNodeInFolder = function (name, parentFolder) { 
  
  //创建待添加的任务节点
  var toBeAddedTask = document.createElement('li');
  toBeAddedTask.className = 'task-item';
  var task_tmpl = '<i class="fa fa-leaf"></i><span class="task-name">' + name + '</span><i class="fa fa-caret-right"></i>';
  toBeAddedTask.innerHTML = task_tmpl;
  //将该任务节点插入父分类文件夹
  parentFolder.appendChild(toBeAddedTask);
  changeHeightOfItemsBox(true, toBeAddedTask);

}

/*
 * 渲染嵌套分类列表方法
*/
var paintNestedFolderList = (function () {
  //一个用来存储列表节点的二维数组[[obj,obj],[obj,obj]],一维代表第n层，二维代表这一层上的节点
  var folderTree = [];
  var folderListArray = toDoStorage.getItemListArray('folder');
  var lenOfFolders = folderListArray.length,
    i;
  if (!lenOfFolders) return;

  for (i = 0; i < lenOfFolders; i++) {
    var currentLevel = folderListArray[i].level;
    //如果folderTree[currentLevel]不存在，说明当前是currentLevel层的第一个节点，将这个item初始化为一个数组
    if (!folderTree[currentLevel]) {
      folderTree[currentLevel] = [];
    }
    folderTree[currentLevel].push(folderListArray[i]);
  }    
   
  //通过线性列表树一层一层地渲染，从第一层开始逐层往下
  var lenOfLevels = folderTree.length,
    j, k;
  for (j = 0; j < lenOfLevels; j++) {
    //如果j这一层有节点
    if (folderTree[j]) {
      var lenOfFoldersOfThisLevel = folderTree[j].length;
      //依次渲染这一层的每一个节点
      for (k = 0; k < lenOfFoldersOfThisLevel; k++) {
        var parentFolder = document.querySelector('[data-folder-id=' + folderTree[j][k].parentFolderID + ']');
        var name = folderTree[j][k].name;
        var num = folderTree[j][k].num;
        var level = folderTree[j][k].level;
        paintFolderNode(name, parentFolder, num, level);
      }
    }
  }

})();

/* 
 * 在分类列表树中渲染任务节点的方法
*/
var paintTaskNodeOfFolderTree = (function () {
  var taskListArray = toDoStorage.getItemListArray('task');
  var lenOfTasks = taskListArray.length,
    i;
  if (!lenOfTasks) return;
  for (i = 0; i < lenOfTasks; i++) {
    var parentFolder = document.querySelector('[data-folder-id=' + taskListArray[i].parentFolderID + ']');
    var name = taskListArray[i].name;
    paintTaskNodeInFolder(name, parentFolder);
  }
})();

/*
 * 在任务分类栏中渲染任务节点的方法
 * @param:
 * type: {string} 
*/
var paintTaskNodeOfTypeColumn = function (type) {
  var taskListArray = toDoStorage.getItemListArray('task');
  var lenOfTasks = taskListArray.length;
  if (!lenOfTasks) return;

  var lenOftypedTaskArr,
    i, j;
  var typedTaskArr = [];
  var ddl_box_container = document.querySelector('.todo-shell-task-lists');
  
  //首先按照任务是否完成的类别或者是全部，将对应的任务取出并放进数组
  for (i = 0; i < lenOfTasks; i++) {
    if (type !== 'all') {
      if (taskListArray[i].type === type) {
        typedTaskArr.push(taskListArray[i]);
      }
    }
    else {
      typedTaskArr.push(taskListArray[i]);
    }
  }

  lenOftypedTaskArr = typedTaskArr.length;
  if (!lenOftypedTaskArr) return;
  
  //根据ddl的大小对分类后的任务数组进行排序
  typedTaskArr.sort(function (a, b) {
    //这么做的原因是因为，JSON解析Date字符串之后并不能还原为一个Date对象，还是一个字符串，所以这里需要再new Date（）一次    
    if (new Date(a.ddl) < new Date(b.ddl)) { return -1; }
    if (new Date(a.ddl) > new Date(b.ddl)) { return 1; }
    return 0;
  });
  
  //用做去除重复时间节点的对象
  var temp_unique_ddl_obj = {}; 
  //然后从最近的时间节点开始渲染
  for (j = 0; j < lenOftypedTaskArr; j++) {

    //先把任务节点准备好，因为不一定能插入到j这个时间节点，因为可能在这之前已经出现过了
    var task_item = document.createElement('li');
    task_item.className = 'task-item';
    var task_item_tmpl = typedTaskArr[j].name;
    var date_type_ddl = new Date(typedTaskArr[j].ddl);
    var timestamp = Date.parse(date_type_ddl.toString());
    var ddl_box; 
    //如果当前这个日期还不存在，那么就渲染该日期节点
    if (!temp_unique_ddl_obj[typedTaskArr[j].ddl]) {
      var year = date_type_ddl.getFullYear();
      var month = date_type_ddl.getMonth() + 1;
      month = month < 10 ? '0' + month : month;
      var day = date_type_ddl.getDate() < 10 ? '0' + date_type_ddl.getDate() : date_type_ddl.getDate();
      ddl_box = document.createElement('ul');
      ddl_box.className = 'time-box';
      var time_title_tmpl = year + '-' + month + '-' + day;
      //如果是还未完成的任务再渲染一个'距XXX天'的HTML
      if (typedTaskArr[j].type === 'todo') {
        var now = new Date();
        var now_time_stamp = Date.parse(now.toString());
        var remainingDays = Math.round((timestamp - now_time_stamp) / (1000 * 60 * 60 * 24 ));
        time_title_tmpl += '<span class="remaining-days"><i class="fa fa-clock-o"></i>' + remainingDays + '天</span>';
      }
      //如果是已经完成的任务就渲染一个'勾'的icon
      else { 
        task_item_tmpl += '<i class="fa fa-check"></i>';        
      }
      ddl_box.innerHTML = '<div class="time-title-box" data-timestamp=' + timestamp + '>' + time_title_tmpl + '</div>';
      ddl_box_container.appendChild(ddl_box);
      
      //把这个已经渲染过的日期存进对象，做一个标记
      temp_unique_ddl_obj[typedTaskArr[j].ddl] = 1;
    }
    else {
      //找到已经存在的这个日期节点，然后插入
      ddl_box = document.querySelector('[data-timestamp="' + timestamp + '"]').parentElement;
    }
    //渲染任务节点
    task_item.innerHTML = task_item_tmpl;    
    ddl_box.appendChild(task_item);
  }

};
paintTaskNodeOfTypeColumn('all');

/*
 * 日期有效性检查&格式化方法
 * @param:
 * dateString:{string} 用户输入的日期字符串
 * return: bool 或一个 日期对象
   若是false说明日期格式有误
   若是日期对象说明日期格式正确
*/
var dateValidityCheck = function (dateString) {
  var dateArr = dateString.split('-');
  var flagOfDateFormat = true, i;
  for (i = 0; i < dateArr.length; i++) {
    if (/\w\s/.test(dateArr[i])) {
      flagOfDateFormat = false;
    }
  }
  if (dateArr.length < 3 || !flagOfDateFormat) {
    return false;
  }
  else {
    var year = parseInt(dateArr[0]);
    var month = parseInt(dateArr[1]);
    var day = parseInt(dateArr[2]);
    if (year / 1000 > 10 || month > 12 || day > 31) {
      return false;
    }
    else {
      if (year < 100) {
        year += 2000;
      }
      var ddl = new Date(year, month - 1, day);
      return ddl;
    }
  }
};

/*
 * 新添加一个任务之后获取数据并进行输入检查与格式化的方法
 * @param:
 * name: {String} 新添加的任务名称
 * ddl: {String} 用户输入
 * @return: undefined 或者 一个task信息对象
 * undefined 说明输入格式有误
 */
var newTaskInfoCheckandFormatted = function (name, ddl, parentFolderID, info) {

  var error_input_prompt = document.querySelector('.input-error-prompt');
  var dateIsValid = dateValidityCheck(ddl);

  if (!name.length) {
    error_input_prompt.style.display = 'block';
    error_input_prompt.innerHTML = '任务名称不能为空！';
    return;
  }
  if (!dateIsValid) {
    error_input_prompt.style.display = 'block';
    error_input_prompt.innerHTML = '日期格式有误！';
    return;
  }
  var ddl_Date_obj = dateIsValid;
  var now = new Date();
  var type = now > ddl_Date_obj ? 'done' : 'todo';
  var new_task_obj = {
    parentFolderID: parentFolderID,
    name: name,
    ddl: ddl_Date_obj,
    info: info,
    type: type
  };
  return new_task_obj;

};

