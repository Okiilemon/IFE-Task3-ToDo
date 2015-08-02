var todoDOM = (function () {
  
  //===================    Begin Category Module  ===================  
  
  //----------   Begin Module Scope Variables  ------------

  //当前被选中的分类文件夹
  var selected_folder; 
        
  //----------   End Module Scope Variables  --------------

  //----------   Begin DOM Method  ------------------------

  var task_total_num = document.querySelector('#task-total-num');
  var all_folders_zone = document.querySelector('.todo-shell-category-lists');
  var add_folder_btn = document.querySelector('.todo-shell-category-add-btn');
  var items = document.querySelectorAll('.item');
  var folder_name_boxes = document.querySelectorAll('.folder-name-box');
  var lenOfFolders, lenOfItems;
  
  /* 
  * 添加新分类弹框上的元素 
  */
  var add_folder_form = document.querySelector('.todo-shell-category-add-form');
  // 输入新分类名称的输入框
  var new_folder_name_input = document.querySelector('#new-folder-title');
  // 确认添加的按钮 
  var submit_new_folder_btn = document.querySelector('#plus-btn');
  //取消添加的按钮 
  var close_add_folder_form = document.querySelector('#close-form-btn');
  var selected_folder_box = add_folder_form.querySelector('#selected-folder');


  //----------   End DOM Method   -------------------------

  //----------   Begin Event Handlers  --------------------

  /*
  * 监听整个区域，通过事件代理给分类文件夹和具体任务绑定'click'事件
  */
  all_folders_zone.addEventListener('click', function (e) {
    var i, j, item_is_active, folder_is_active;
    var items = this.querySelectorAll('.task-item');
    var folder_name_boxes = this.querySelectorAll('.folder-name-box');
    var lenOfFolders = folder_name_boxes.length;
    var lenOfTaskItems = items.length;
    // 当点击的区域属于某个任务 item
    if (e.target.className == 'task-item' || e.target.parentElement.className == 'task-item') {

      var task_item_target = e.target.className == 'task-item' ? e.target : e.target.parentElement;
      //给每一个task item 绑定click事件，点击之后在右侧显示相应的任务信息
      var taskID = parseInt(task_item_target.getAttribute('data-task-id'));
      var task_obj = toDoStorage.getItem('task', 'taskID', taskID);
      paintInfoDisplayArea(task_obj);

      for (j = 0; j < lenOfTaskItems; j++) {
        item_is_active = items[j].getAttribute('data-item-selected');
        //将当前的 item active 样式取消
        if (item_is_active == 'true') {
          items[j].setAttribute('data-item-selected', 'false');
        }
        //给点击的 item 加上 active 样式
        if (items[j].contains(e.target)) {
          items[j].setAttribute('data-item-selected', 'true');
        }
      }
      return;
    }
    else if (e.target.className == 'fa fa-close') {
      var folder_name_box = e.target.parentElement;
      var target = folder_name_box.parentElement;
      
      removeFolder(target);
    }
    // 当点击的区域属于某个任务文件夹 folder-name-box
    else {
      for (i = lenOfFolders - 1; i >= 0; i--) {
        folder_is_active = folder_name_boxes[i].getAttribute('data-folder-selected');
        //将当前的 folder active 样式取消
        if (folder_is_active == 'true') {
          folder_name_boxes[i].setAttribute('data-folder-selected', 'false');
        }
        //给点击的 folder 加上 Active 样式
        if (folder_name_boxes[i].contains(e.target)) {
          folder_name_boxes[i].setAttribute('data-folder-selected', 'true');
          if (i) { //否则当点击'分类列表’这个特殊folder的时候第一个task-items-box会出现下拉效果
            dropDownList(folder_name_boxes[i].parentElement);
          }
        }
      }
    }
  }, false);

  /*
  * 点击“添加分类按钮”弹出表单
  */
  add_folder_btn.addEventListener('click', function (e) {
    var selected_folder_value;
    //取值
    selected_folder = document.querySelector('[data-folder-selected="true"]');
    selected_folder_value = selected_folder.querySelector('.folder-name').innerHTML;
    //填值
    selected_folder_box.innerHTML = selected_folder_value;
    add_folder_form.style.display = 'block';
  }, false);

  /*
  * 监听输入框用户输入的情况
  */
  new_folder_name_input.addEventListener('keyup', function () {
    var inputValue = '';
    inputValue = this.value;
    //当输入值为空时，隐藏掉右侧的‘添加’按钮
    submit_new_folder_btn.style.display = inputValue.length ? 'inline' : 'none';
  }, false);
    
  /*
   * 用户添加一个新分类时执行的一系列动作
   * 因为在点击添加按钮和按下回车都有执行
   * 所以这里封装成一个方法方便调用
 */
  var addNewFolder = function () {
    var folderID = toDoStorage.getItemListArray('folder').length + 1;
    var new_folder_name = new_folder_name_input.value;
    //新节点要插入的容器
    var toBeAddedBox = selected_folder.nextElementSibling;
    //取得父分类文件夹节点的层级
    var parentNodeLevel = parseInt(selected_folder.getAttribute('data-tree-level'));
    //取得父容器的ID
    var parentFolderID = toBeAddedBox.getAttribute('data-folder-id');

    var newNodeLevel = parentNodeLevel + 1;
      
    //渲染节点
    paintFolderNode(folderID, new_folder_name, toBeAddedBox, newNodeLevel);
    //将数据存入localStorage
    var newFolderItem = {
      folderID: folderID,
      name: new_folder_name,
      parentFolderID: parentFolderID,
      level: newNodeLevel
    };
    toDoStorage.addItem('folder', newFolderItem);
    add_folder_form.style.display = 'none';
    new_folder_name_input.value = '';
    
    //判断一下当前是否处于编辑任务状态,如果是将当前新添加的分类加到下拉列表中
    if (document.querySelector('.edit-form-head-area')) { 
      var new_folder_option = document.createElement('option');
      var select = document.getElementsByTagName('select')[0];
      new_folder_option.setAttribute('data-folder-id', folderID);
      new_folder_option.innerHTML = new_folder_name;
      select.insertBefore(new_folder_option, select.firstChild);
      select.value = new_folder_name;
      
    }
  }

  new_folder_name_input.addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
      addNewFolder();
    }
  }, false)

  /*
  * 点击输入框上的“添加”按钮，添加新分类
  */
  submit_new_folder_btn.addEventListener('click', function (e) {
    addNewFolder();
  }, false);

  /*
  * 点击表单的关闭按钮，关闭表单并且清空用户的输入数据
  */
  close_add_folder_form.addEventListener('click', function () {
    add_folder_form.style.display = 'none';
    new_folder_name_input.value = '';
  }), false;
    
    
  //-------------------   End Event Handlers  ----------------------
  
  //===================    End Category Module  ===================  
   
   
  //===================  Begin Task Module  ======================
   
  //-------------------   Begin DOM Method  ------------------------

  var task_type_area = document.querySelector('.task-type-area');
  var add_new_task_btn = document.querySelector('.todo-shell-task-add-btn');
  var todo_task_lists_area = document.querySelector('.todo-shell-task-lists');
  //任务分类All,todo,done
  task_type_area.addEventListener('click', function (e) {
    var type = e.target.getAttribute('data-type');
    toggleTaskItemByType(type);
  }, false)

  todo_task_lists_area.addEventListener('click', function (e) { 
    //给每一个task item 绑定click事件，点击之后在右侧显示相应的任务信息
    if (e.target.className === 'task-item' || e.target.parentElement.className === 'task-item') {
      var taskID = parseInt(e.target.getAttribute('data-task-id'));
      var task_obj = toDoStorage.getItem('task', 'taskID', taskID);
      paintInfoDisplayArea(task_obj);
    }
  }, false);

  add_new_task_btn.addEventListener('click', function () {

    //先判断当前是否处于编辑状态
    if (document.querySelector('.edit-form-head-area')) {
      var headArea = document.querySelector('.edit-form-head-area');
      var nameInput = headArea.querySelector('#new-task-name').value;
      //处于新添任务状态
      if (!nameInput.length) {
        alert('您当前已经处于新添任务的状态');
        return;
      }
      //处于编辑任务状态
      else {
        paintInfoEditArea(false);
      }

    }
    else { //当前处于任务展示状态，取得当前的任务对象用于点击‘取消’按钮时回退
      var currentTaskID = parseInt(document.querySelector('.info-task-name').getAttribute('data-task-id'));
      var task = toDoStorage.getItem('task', 'taskID', currentTaskID);
      paintInfoEditArea(false, task);
    }

  }, false)

})();