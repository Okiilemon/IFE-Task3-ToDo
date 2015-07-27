
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
    '<div class="folder-name-box" data-folder-selected="false">'
    + '<i class="fa fa-folder"></i>'
    + '<i class="fa fa-folder-open-o"></i>'
    + '<span class="folder-name">' + name + '</span>'
    + '  (<span class="task-num"></span>)'
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
 * 在分类栏下渲染时间节点的方法
 * @param 
 * name {string} 任务名称
 * ddl_string {string}  序列化之后的任务日期字符串
 * type {string} 任务类型
*/

var paintTimeNode = function (ddl_string, type) {

  var timeNode_container = document.querySelector('.todo-shell-task-lists');
  var timeNode = document.createElement('ul');
  timeNode.className = 'time-box';
  var date_obj = new Date(ddl_string);
  var timestamp = Date.parse(date_obj.toString());  
  //格式化日期的显示
  var year = date_obj.getFullYear();
  var month = date_obj.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  var day = date_obj.getDate() < 10 ? '0' + date_obj.getDate() : date_obj.getDate();

  var time_title_tmpl = year + '-' + month + '-' + day;
  //如果是还未完成的任务再渲染一个'距XXX天'的HTML
  if (type === 'todo') {
    var now = new Date();
    var now_time_stamp = Date.parse(now.toString());
    var remainingDays = Math.round((timestamp - now_time_stamp) / (1000 * 60 * 60 * 24));
    time_title_tmpl += '<span class="remaining-days"><i class="fa fa-clock-o"></i>' + remainingDays + '天</span>';
  }
  timeNode.innerHTML = '<div class="time-title-box" data-timestamp=' + timestamp + '>' + time_title_tmpl + '</div>';
  timeNode_container.appendChild(timeNode);
  return timeNode;
}


/*
 * 在分类栏时间节点下渲染任务节点的方法
 * @param 
 * name {string} 任务名称
 * ddl_string {string}  序列化之后或之前的任务日期字符串
 * type {string} 任务类型
 * parentTimeNode {object node} [optional] 父时间节点
*/

var paintTaskNodeOfTimeNode = function (name, ddl_string, type, parentTimeNode) { 
  
  //创建任务节点
  var task_item = document.createElement('li');
  task_item.className = 'task-item';
  var task_item_tmpl = name;
  //如果没有传入父时间节点
  if (!parentTimeNode) { 
    //先判断一下这个父时间节点是否已经存在
    var ddl_date_obj = new Date(ddl_string);
    var timestamp_of_the_task = Date.parse(ddl_date_obj.toString());
    if (document.querySelector('[data-timestamp="' + timestamp_of_the_task + '"]')) {
      parentTimeNode = document.querySelector('[data-timestamp="' + timestamp_of_the_task + '"]').parentElement;
    }
    else {
      parentTimeNode = paintTimeNode(ddl_string, type);
    }
  }
  //如果类型为todo，则多渲染一个表示做完的icon
  if (type === 'done') {
    task_item_tmpl += '<i class="fa fa-check"></i>';
  }
  task_item.innerHTML = task_item_tmpl;
  parentTimeNode.appendChild(task_item);
}

/*
 * 在任务分类栏中渲染时间节点与任务节点的方法 || 在页面载入与切换分类时均可用到该方法
 * @param:
 * type: {string} 
*/
var paintTaskNodeOfTypeColumn = function (type) {
  var taskListArray = toDoStorage.getItemListArray('task');
  var lenOfTasks = taskListArray.length;
  if (!lenOfTasks) return;

  var lenOftypedTaskArr,
    i, j;
  //分类后的任务节点数组    
  var typedTaskArr = [];
  //初始化,清空现有内容
  var timeNode_container = document.querySelector('.todo-shell-task-lists');
  timeNode_container.innerHTML = '';
  //首先按照任务是否完成的类别或者是全部，将对应的任务取出并放进数组
  for (i = 0; i < lenOfTasks; i++) {
    if (type !== 'all') {
      //将属于todo或者done类型的任务节点取出，放进数组
      if (taskListArray[i].type === type) {
        typedTaskArr.push(taskListArray[i]);
      }
    }
    //将所有任务节点放进数组
    else {
      typedTaskArr.push(taskListArray[i]);
    }
  }

  lenOftypedTaskArr = typedTaskArr.length;
  
  //根据日期的大小对分类后的任务数组进行排序
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
    
    //如果当前这个日期还不存在，那么就渲染该日期节点
    if (!temp_unique_ddl_obj[typedTaskArr[j].ddl]) {
      var timeNode = paintTimeNode(typedTaskArr[j].ddl, typedTaskArr[j].type);
      paintTaskNodeOfTimeNode(typedTaskArr[j].name, typedTaskArr[j].ddl, typedTaskArr[j].type, timeNode)   
      //把这个已经渲染过的日期存进对象，做一个标记
      temp_unique_ddl_obj[typedTaskArr[j].ddl] = 1;
    }
    else {
      paintTaskNodeOfTimeNode(typedTaskArr[j].name, typedTaskArr[j].ddl, typedTaskArr[j].type);
    }
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
var newTaskInfoCheckandFormatted = function (taskID, name, ddl, parentFolderID, info) {

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
    taskID: taskID,
    parentFolderID: parentFolderID,
    name: name,
    ddl: ddl_Date_obj,
    info: info,
    type: type
  };
  return new_task_obj;

};

/*
 * 渲染任务信息展示区域
 * @param
 * task_obj {obj} 一个task对象
 */
var paintInfoDisplayArea = function (task_obj) {
  var info_container = document.querySelector('.todo-shell-info-area');
  var date_obj = new Date(task_obj.ddl);
  //格式化日期的显示
  var year = date_obj.getFullYear();
  var month = date_obj.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  var day = date_obj.getDate() < 10 ? '0' + date_obj.getDate() : date_obj.getDate();
  var time_title_tmpl = year + '-' + month + '-' + day;
  var info_head_tmpl =
    '<div class="display-head-area info-head-area">'
    + '<div class="info-task-name" title="任务名称"><i class="fa fa-leaf"></i>'
    + '<span class="task-name">' + task_obj.name + '</span></div>'
    + '<div class="info-affiliated-folder" title="所属分类"><i class="fa fa-folder"></i>'
    + '<span class="affiliated-folder-name">' + task_obj.parentFolderID + '</span></div>'
    + '<div class="info-task-ddl" title="预计完成时间"><i class="fa fa-calendar-o"></i>'
    + '<span class="task-ddl">' + time_title_tmpl + '</span></div>';

  if (task_obj.type === 'todo') {
    info_head_tmpl += '<div class="info-completed-btn"><i class="fa fa-check"></i>完成任务</div>';
  }
  var info_content;
  if (task_obj.info.length === 0) {
    info_content = '<span id="no-content-prompt">您还没有添加任务描述信息..</span>'
  }
  else {
    info_content = task_obj.info;
  }
  var info_body_tmpl =
    '</div><div class="display-content-area">' + info_content + '</div>'
    + '<div class="edit-btn"><i class="fa fa-pencil"></i>编辑任务</div>';

  info_container.innerHTML = info_head_tmpl + info_body_tmpl;
  var task_edit_btn = document.querySelector('.edit-btn');

  task_edit_btn.onclick = function () {
    var task = {
      taskID: task_obj.taskID,
      name: task_obj.name,
      ddl: time_title_tmpl,
      parentFolderID: task_obj.parentFolderID,
      info: task_obj.info
    };
    paintInfoEditArea(task, true);
  };

}
//paintInfoDisplayArea(toDoStorage.getItemListArray('task')[0]);

/*
 * 渲染任务信息编辑区域
 * @param
 * task_obj {object} [optional] 
 */
var paintInfoEditArea = function (task_obj, change_flag) {
  var info_container = document.querySelector('.todo-shell-info-area');
  var folder_lists = toDoStorage.getItemListArray('folder');
  var lenOfFolders = folder_lists.length, i;
  var option_tmpl = '';

  for (i = 0; i < lenOfFolders; i++) {
    option_tmpl += '<option>' + folder_lists[i].name + '</option>';
  }

  var edit_tmpl =
    '<div class="edit-form-head-area info-head-area">'
    + '<div class="info-task-name"><i class="fa fa-leaf"></i><label for="new-task-name">任务名称</label>'
    + '<input type="text" id="new-task-name" autofocus="autofocus"></div>'
    + '<div class="info-affiliated-folder"><i class="fa fa-folder"></i>'
    + '<label for="new-affiliated-folder">所属分类</label><select id="new-affiliated-folder">' + option_tmpl + '</select></div>'
    + '<div class="info-task-ddl"><i class="fa fa-calendar-o"></i><label for="new-task-ddl">截止日期</label>'
    + '<input type="text" id="new-task-ddl" placeholder="日期格式：yyyy-mm-dd"></div>'
    + '<div class="input-error-prompt">! 日期格式有误，请正确输入</div></div>'
    + '<div class="edit-form-content-area"><textarea name="task-info" id="task-info-input" cols="60" rows="25" placeholder="任务描述信息..."></textarea>'
    + '<div class="info-btn-wrapper">'
    + '<div class="ok info-btn ">'
    + '<i class="fa fa-plus"></i>确认添加</div>'
    + '<div class="cancel info-btn">'
    + '<i class="fa fa-close"></i>取消</div></div></div>';
  info_container.innerHTML = edit_tmpl;
  
  //编辑任务表单元素
  var edit_task_name_input = document.querySelector('#new-task-name');
  var edit_affiliated_folder_select = document.querySelector('#new-affiliated-folder');
  var edit_task_ddl_input = document.querySelector('#new-task-ddl');
  var edit_task_info_textarea = document.querySelector('#task-info-input');
  var submit_task_info_btn = document.querySelector('.ok');
  var cancel_task_info_btn = document.querySelector('.cancel');

  //如果是true 那么渲染‘确认更改’若不是‘确认添加按钮’,这里为了区分是‘添加任务’还是‘编辑任务’中的回调
  if (task_obj) {
    submit_task_info_btn.innerText = '确认更改';
        
    edit_task_name_input.value = task_obj.name;
    edit_affiliated_folder_select.value = task_obj.parentFolderID;
    edit_task_ddl_input.value = task_obj.ddl;
    edit_task_info_textarea.value = task_obj.info;
  }

  submit_task_info_btn.addEventListener('click', function () {
    //首先取得此时输入框中用户填入或更改的数据
    var taskID = task_obj ? task_obj.taskID : toDoStorage.getItemListArray('task').length + 1;
    var name = edit_task_name_input.value;
    var parentFolderID = edit_affiliated_folder_select.value;
    var ddl = edit_task_ddl_input.value;
    var info = edit_task_info_textarea.value;

    var new_task_obj = newTaskInfoCheckandFormatted(taskID, name, ddl, parentFolderID, info);
    
    if (!new_task_obj) return;

    if (task_obj) {//响应‘确认更改’的操作
      toDoStorage.setItem('task', task_obj.taskID, new_task_obj);
    }
    else { //相应‘确认添加’的操作
      //将用户输入的数据取出并存入localStorage
      toDoStorage.addItem('task', new_task_obj);
      var toBeAddedFolder = document.querySelector('[data-folder-id=' + parentFolderID + ']');
      paintTaskNodeInFolder(name, toBeAddedFolder);
      paintTaskNodeOfTimeNode(name, new_task_obj.ddl, new_task_obj.type);      
    }
    


    paintInfoDisplayArea(new_task_obj);
    

  }, false)

  cancel_task_info_btn.addEventListener('click', function () {
    paintInfoDisplayArea(task_obj);
  }, false)
}
