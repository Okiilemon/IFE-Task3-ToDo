var toDoInit = (function () { 
  //用户第一次载入此页面时将默认分类存入localStorage中
  if (!toDoStorage.getItemListArray('folder').length) {
    var default_folder_obj = {
      folderID: 1,
      name: '默认分类',
      parentFolderID: 'root-folder',
      level: 0
    };
    toDoStorage.addItem('folder', default_folder_obj);

    var now = new Date();
    //向默认分类中添加一个默认的任务
    var default_task_obj = {
      taskID: 1,
      name: '使用说明',
      parentFolderID: 1,
      ddl: now,
      info: '欢迎使用 One Leaf 个人任务管理 Web 应用 ~ <br>'
      + '<br><p><i class="fa fa-leaf"></i> 代表你创建的任务 </p>'
      + '<p><i class="fa fa-calendar-o"></i> 代表任务完成的截止日期 </p>'
      + '<p><i class="fa fa-folder"></i> 代表任务所属的分类</p><br>'
      + '<p>● 在添加分类时，支持嵌套分类，如果想在一级分类中创建分类，点击[分类列表]即可；或者想要在某一分类下创建子级分类，则需要先点击您想添加到的分类文件夹（父分类），否则会默认添加到当前处于被选中状态的分类文件夹。</p><br>'
      + '<p>● 在添加任务时，如果设定的截止日前在今天以前那么默认为[已完成]状态，否则默认为[未完成]状态;所属分类那里是一个下拉选项框，点击后选择您想要添加到的分类文件夹即可。<p><br>'
      + '<p>● 无论任务当前处于何种状态，您都可以对其进行编辑。</p><br>'
      + '<p>Tips: 如果您使用的是Chrome浏览器，再添加分类时最好不要通过按Enter键来添加，而是按'+'号来添加，否则部分用户会遇到页面抖动，该bug正在紧急修复中</p>
    }
    toDoStorage.addItem('task', default_task_obj);
  }

})()

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
 * folderID: {number} 分类列表的唯一标示符
 * name:{string} 新写入的这个分类列表的名字
 * parentFolderID: {string} 上一级分类文件夹的唯一标示符（文件夹的名字）
 * level: {number} 这个分类列表在嵌套列表树中所处的层级     
 * 
*/
var paintFolderNode = function (folderID, name, parentFolder, level) {

  //创建待添加的新分类节点
  var toBeAddedFolder = document.createElement('li');
  toBeAddedFolder.className = 'task-folder';
  var folder_tmpl =
    '<div class="folder-name-box" data-folder-selected="false" data-tree-level="' + level + '">'
    + '<i class="fa fa-folder"></i>'
    + '<i class="fa fa-folder-open-o"></i>'
    + '<span class="folder-name">' + name + '</span>'
    + '  (<span class="task-num"> 0 </span>)'
    + '<i class="fa fa-close"></i>'
    + '</div>'
    + '<ul class="task-items-box" data-is-opened="false" data-folder-id="' + folderID + '"></ul>';
  //插入DOM
  toBeAddedFolder.innerHTML = folder_tmpl;
  parentFolder.appendChild(toBeAddedFolder);

  changeHeightOfItemsBox(true, toBeAddedFolder);
  return toBeAddedFolder;
}

/*
 * 动态改变一个分类中子任务数视图的方法,再添加或者删除一个任务时都会用到该方法
 * @param
 * targetTask: {obj node} 被添加的或被删除的任务节点
 * type: {num} -1 数量减一， 1 数量加一, 或任意正整数负整数
 * totalNumNode: {obj node} [option]总任务数节点
*/
var changeTheNumOfTask = function (targetTask, type, totalNumNode) {

  var totalNumBox = totalNumNode ? totalNumNode : document.querySelector('#task-total-num');

  //遍历所有的分类节点，如果包含当前新添加的任务，那么任务数就改变
  var numOfTotalTasks = parseInt(totalNumBox.innerHTML);
  var allFolderNodes = document.querySelectorAll('.task-items-box');
  var lenOfFolders = allFolderNodes.length,
    i;
  for (i = 0; i < lenOfFolders; i++) {
    if (allFolderNodes[i].contains(targetTask)) {
      var thisNumBox = allFolderNodes[i].previousElementSibling.querySelector('.task-num');
      var numOfThisTasks = parseInt(thisNumBox.innerHTML);
      thisNumBox.innerHTML = (numOfThisTasks + type).toString();
    }
  }
  totalNumBox.innerHTML = (numOfTotalTasks + type).toString();
}

/* 
 * 在分类文件夹下渲染任务节点的方法
 * @param:
 * name: {string} 任务名称
 * parentFolder: {obj node} 父分类文件夹节点
 * taskTotlaNumNode: {obj node} 任务总数节点
*/
var paintTaskNodeInFolder = function (name, parentFolder, taskID) {
  
  //创建待添加的任务节点
  var toBeAddedTask = document.createElement('li');
  toBeAddedTask.className = 'task-item';
  toBeAddedTask.setAttribute('data-task-id', taskID);
  var task_tmpl = '<i class="fa fa-leaf"></i><span class="task-name">' + name + '</span><i class="fa fa-caret-right"></i>';
  toBeAddedTask.innerHTML = task_tmpl;
  //将该任务节点插入父分类文件夹
  parentFolder.appendChild(toBeAddedTask);
  changeHeightOfItemsBox(true, toBeAddedTask);

  changeTheNumOfTask(toBeAddedTask, 1);
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
        var parentFolder = document.querySelector('[data-folder-id="' + folderTree[j][k].parentFolderID + '"]');
        var name = folderTree[j][k].name;
        var level = folderTree[j][k].level;
        var folderID = folderTree[j][k].folderID;
        paintFolderNode(folderID, name, parentFolder, level);
      }
    }
  }

})();

/* 
 * 在分类列表树中渲染任务节点的方法
*/
var paintTaskNodeOfFolderTree = (function () {
  var totalNumNode = document.querySelector('#task-total-num');
  var taskListArray = toDoStorage.getItemListArray('task');
  var lenOfTasks = taskListArray.length,
    i;
  if (!lenOfTasks) return;
  for (i = 0; i < lenOfTasks; i++) {
    var parentFolder = document.querySelector('[data-folder-id="' + taskListArray[i].parentFolderID + '"]');
    var name = taskListArray[i].name;
    paintTaskNodeInFolder(name, parentFolder, taskListArray[i].taskID, totalNumNode);
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
 * taskID {string} 唯一标示任务的ID
 * name {string} 任务名称
 * ddl_string {string}  序列化之后或之前的任务日期字符串
 * type {string} 任务类型
 * parentTimeNode {object node} [optional] 父时间节点
*/

var paintTaskNodeOfTimeNode = function (taskID, name, ddl_string, type, parentTimeNode) { 
  
  //创建任务节点
  var task_item = document.createElement('li');
  task_item.className = 'task-item';
  task_item.setAttribute('data-task-id', taskID);
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
  task_item_tmpl += '<i class="fa fa-close remove-task-btn"></i>';
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
      paintTaskNodeOfTimeNode(typedTaskArr[j].taskID, typedTaskArr[j].name, typedTaskArr[j].ddl, typedTaskArr[j].type, timeNode)   
      //把这个已经渲染过的日期存进对象，做一个标记
      temp_unique_ddl_obj[typedTaskArr[j].ddl] = 1;
    }
    else {
      paintTaskNodeOfTimeNode(typedTaskArr[j].taskID, typedTaskArr[j].name, typedTaskArr[j].ddl, typedTaskArr[j].type);
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
 * 切换到对应类型任务视图的方法
 */
var toggleTaskItemByType = function (type) {
  var task_type_area = document.querySelector('.task-type-area');
  var active_underline = document.querySelector('.active-underline');
  var size = parseInt(getComputedStyle(task_type_area, null).getPropertyValue('width')) / 3;
  var targetIndex;    
  //对应类型任务的切换
  switch (type) {
    case 'all':
      paintTaskNodeOfTypeColumn('all');
      targetIndex = 0;
      break;
    case 'todo':
      paintTaskNodeOfTypeColumn('todo');
      targetIndex = 1;
      break;
    case 'done':
      paintTaskNodeOfTypeColumn('done');
      targetIndex = 2;
      break;
    default:
      return;
  }
  var movingDistance = (targetIndex * size + 20) + 'px';
  active_underline.style.left = movingDistance;
}

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
  var folderName = toDoStorage.getItem('folder', 'folderID', task_obj.parentFolderID).name;
  var info_head_tmpl =
    '<div class="display-head-area info-head-area">'
    + '<div class="info-task-name" title="任务名称" data-task-id="' + task_obj.taskID + '"><i class="fa fa-leaf"></i>'
    + '<span class="task-name">' + task_obj.name + '</span></div>'
    + '<div class="info-affiliated-folder" title="所属分类"><i class="fa fa-folder"></i>'
    + '<span class="affiliated-folder-name">' + folderName + '</span></div>'
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
    if (task_obj.taskID === 1) { 
      alert('抱歉，使用说明不能编辑');
      return;
    }
    var task = {
      taskID: task_obj.taskID,
      name: task_obj.name,
      ddl: time_title_tmpl,
      parentFolderID: task_obj.parentFolderID,
      info: task_obj.info,
      ddl_obj: task_obj.ddl
    };
    paintInfoEditArea(true, task);
  };

  if (document.querySelector('.info-completed-btn')) {
    var completedBtn = document.querySelector('.info-completed-btn');
    completedBtn.addEventListener('click', function (e) {
      e.target.innerHTML = '<i class="fa fa-check"></i>已完成';

      toDoStorage.setItem('task', task_obj.taskID, { 'type': 'done' });

      toggleTaskItemByType('done');
    }, false);
  }

}
paintInfoDisplayArea(toDoStorage.getItemListArray('task')[0]);

/*
 * 渲染任务信息编辑区域
 * @param
 * ifIsEdit {bool}  true:当前是编辑状态 false:当前是新添加状态
 * task_obj {object} [optional]
 */
var paintInfoEditArea = function (ifIsEdit, task_obj) {
  var info_container = document.querySelector('.todo-shell-info-area');
  var folder_lists = toDoStorage.getItemListArray('folder');
  var lenOfFolders = folder_lists.length, i;
  var option_tmpl = '';

  for (i = 0; i < lenOfFolders; i++) {
    option_tmpl += '<option data-folder-id=' + folder_lists[i].folderID + '>' + folder_lists[i].name + '</option>';
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
    + '<div class="edit-form-content-area"><textarea name="task-info" id="task-info-input" cols="60" rows="25" placeholder="任务描述信息..."></textarea></div>'
    + '<div class="info-btn-wrapper">'
    + '<div class="ok info-btn ">'
    + '<i class="fa fa-plus"></i>确认添加</div>'
    + '<div class="cancel info-btn">'
    + '<i class="fa fa-close"></i>取消</div></div>';
  info_container.innerHTML = edit_tmpl;
  
  //编辑任务表单元素
  var edit_task_name_input = document.querySelector('#new-task-name');
  var edit_affiliated_folder_select = document.querySelector('#new-affiliated-folder');
  var edit_task_ddl_input = document.querySelector('#new-task-ddl');
  var edit_task_info_textarea = document.querySelector('#task-info-input');
  var submit_task_info_btn = document.querySelector('.ok');
  var cancel_task_info_btn = document.querySelector('.cancel');

  //如果是true 那么渲染‘确认更改’若不是‘确认添加按钮’,这里为了区分是‘添加任务’还是‘编辑任务’中的回调
  if (ifIsEdit) {
    submit_task_info_btn.innerText = '确认更改';
    var parentFolderName = toDoStorage.getItem('folder', 'folderID', task_obj.parentFolderID).name;
    edit_task_name_input.value = task_obj.name;
    edit_affiliated_folder_select.value = parentFolderName;
    edit_task_ddl_input.value = task_obj.ddl;
    edit_task_info_textarea.value = task_obj.info;
  }
  else {//这里是让所属分类的下拉框默认选中当前选中的分类
    var selected_folder_name = document.querySelector('[data-folder-selected="true"]').querySelector('.folder-name').innerHTML;
    edit_affiliated_folder_select.value = selected_folder_name;
  }

  //给'确认按钮'绑定事件，这里要判断一下是'确认添加'还是'确认更改'
  submit_task_info_btn.addEventListener('click', function () {
    //首先取得此时输入框中用户填入或更改的数据
    var taskID;
    //如果此时是'更改'的操作，取到当前更改的任务ID
    if (ifIsEdit && task_obj) {
      taskID = task_obj.taskID;
    }
    //如果此时是'添加'的操作，那么就生成一个新的ID
    else {
      taskID = toDoStorage.getItemListArray('task').length + 1;
    }
    var name = edit_task_name_input.value;
    var parentFolderID = parseInt(edit_affiliated_folder_select[edit_affiliated_folder_select.selectedIndex].getAttribute('data-folder-id'));
    var ddl = edit_task_ddl_input.value;
    var info = edit_task_info_textarea.value;

    var new_task_obj = newTaskInfoCheckandFormatted(taskID, name, ddl, parentFolderID, info);

    if (!new_task_obj) return;

    if (ifIsEdit && task_obj) {//响应‘确认更改’的操作
      
      //创建一个作用域
      (function () {
        toDoStorage.setItem('task', task_obj.taskID, new_task_obj);
        
        //首先改变分类列表中的视图
        //先删除原来的节点
        var foldersContainer = document.querySelector('.todo-shell-category-lists');
        var currentTaskNode = foldersContainer.querySelector('[data-task-id="' + task_obj.taskID + '"]');
        var currentParentFolder = document.querySelector('[data-folder-id="' + task_obj.parentFolderID + '"]');
        currentParentFolder.removeChild(currentTaskNode);
        //再渲染更改后的节点（见else后）
      
        //改变时间栏中的视图
        toggleTaskItemByType(new_task_obj.type);
      } ());

    }
    else { //响应‘确认添加’的操作
      //将用户输入的数据取出并存入localStorage
      toDoStorage.addItem('task', new_task_obj);
    }
    var toBeAddedFolder = document.querySelector('[data-folder-id="' + parentFolderID + '"]');
    paintTaskNodeInFolder(name, toBeAddedFolder, new_task_obj.taskID);
    toggleTaskItemByType(new_task_obj.type);
    
    paintInfoDisplayArea(new_task_obj);

  }, false)

  cancel_task_info_btn.addEventListener('click', function () {
    paintInfoDisplayArea(task_obj);
  }, false)
}

// ------- 嵌套列表中删除操作与动态增加任务数的操作由于受到嵌套的影响，所以比较复杂，单独写一个方法 -----

/*
 * 删除某个分类文件夹的方法
 * @param
 * removeFolderItem: {obj node} 要删除的分类文件夹节点
 */
var removeFolder = function (removeFolderItem) {

  var folderContainer = removeFolderItem.parentElement;
  var childrenContainer = removeFolderItem.lastElementChild;
  var currentFolderID = parseInt(childrenContainer.getAttribute('data-folder-id'));
  if (currentFolderID === 1) {
    alert('抱歉，默认分类不能删除');
    return;
  }
  var ifConfirm = confirm('此分类删除后，它的所有子分类以及子任务都将被删除，且不可恢复，确认删除？');
  if (!ifConfirm) { return }
  else {
    var childrenFolders = childrenContainer.querySelectorAll('.task-items-box');
    var childrenTasks = childrenContainer.querySelectorAll('.task-item');    
  
    //删除子分类
    if (childrenFolders) {
      var lenOfChildrenFolders = childrenFolders.length,
        i;
      for (i = 0; i < lenOfChildrenFolders; i++) {
        var thisFolderID = parseInt(childrenFolders[i].getAttribute('data-folder-id'));
        toDoStorage.removeItem('folder', 'folderID', thisFolderID);
      }
    }
    //删除子任务
    if (childrenTasks) {
      var lenOfChildrenTasks = childrenTasks.length,
        j;
      for (j = 0; j < lenOfChildrenTasks; j++) {
        var thisTaskID = parseInt(childrenTasks[j].getAttribute('data-folder-id'));
        toDoStorage.removeItem('folder', 'folderID', thisTaskID);
      }
    }
    //删除当前分类节点
    toDoStorage.removeItem('folder', 'folderID', currentFolderID);
    //总任务数相应减少此分类下的任务数
    var thisFolderTasksNum = parseInt(childrenContainer.previousElementSibling.querySelector('.task-num').innerHTML);
    thisFolderTasksNum = (-1) * thisFolderTasksNum;
    changeTheNumOfTask(removeFolderItem, thisFolderTasksNum);
    folderContainer.removeChild(removeFolderItem);
  }
}
 
 


