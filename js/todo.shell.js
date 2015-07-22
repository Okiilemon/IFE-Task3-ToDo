var todoDOM = (function(){

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
  var lenOfFolders,lenOfItems;
  
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
    all_folders_zone.addEventListener('click',function(e){
      var i,j,item_is_active,folder_is_active;
      var items = this.querySelectorAll('.task-item');
      var folder_name_boxes = this.querySelectorAll('.folder-name-box');
      var lenOfFolders = folder_name_boxes.length;
      var lenOfTaskItems = items.length;
      // 当点击的区域属于某个任务 item
      if(e.target.className == 'task-item' || e.target.parentElement.className == 'task-item'){
        for(j=0; j<lenOfTaskItems; j++){
          item_is_active = items[j].getAttribute('data-item-selected');
          //将当前的 item active 样式取消
          if(item_is_active == 'true'){
            items[j].setAttribute('data-item-selected','false');
          }
          //给点击的 item 加上 active 样式
          if(items[j].contains(e.target)){
            items[j].setAttribute('data-item-selected','true');
          }
        }
        return;
      }
      else if(e.target.className == 'fa fa-close'){
        var container = e.target.parentElement.parentElement.parentElement;
        var folder_name_box = e.target.parentElement;
        var target = folder_name_box.parentElement;
        var currentFolderName = folder_name_box.querySelector('.folder-name').innerHTML;
        var childrenFolder = folder_name_box.nextElementSibling.querySelectorAll('.task-folder');
        if(childrenFolder){
          var lenOfChildernFolder = childrenFolder.length,
              i;
          for(i=0; i<lenOfChildernFolder; i++){
            var nameOfChildrenFolder = childrenFolder[i].querySelector('.folder-name').innerHTML;
            toDoStorage.removeItem(nameOfChildrenFolder);
          }
        }
        toDoStorage.removeItem('folder', currentFolderName);
        container.removeChild(target);
      }
      // 当点击的区域属于某个任务文件夹 folder-name-box
      else{
        for(i=lenOfFolders-1; i>=0; i--){
          folder_is_active = folder_name_boxes[i].getAttribute('data-folder-selected');
          //将当前的 folder active 样式取消
          if(folder_is_active == 'true'){
            folder_name_boxes[i].setAttribute('data-folder-selected','false');
          }
          //给点击的 folder 加上 Active 样式
          if(folder_name_boxes[i].contains(e.target)){
            folder_name_boxes[i].setAttribute('data-folder-selected','true');
            if(i){ //否则当点击'分类列表’这个特殊folder的时候第一个task-items-box会出现下拉效果
              dropDownList(folder_name_boxes[i].parentElement);
            }
          }
        }        
      }     
    },false);

    /*
    * 点击“添加分类按钮”弹出表单
    */
    add_folder_btn.addEventListener('click',function(e){
      var selected_folder_value;
      //取值
      selected_folder = document.querySelector('[data-folder-selected="true"]');
      selected_folder_value = selected_folder.querySelector('.folder-name').innerHTML;
      //填值
      selected_folder_box.innerHTML = selected_folder_value;
      add_folder_form.style.display = 'block';
    },false);

    /*
    * 监听输入框用户输入的情况
    */
    new_folder_name_input.addEventListener('keyup',function(){
      var inputValue = '';
      inputValue = this.value;
      //当输入值为空时，隐藏掉右侧的‘添加’按钮
      submit_new_folder_btn.style.display = inputValue.length ? 'inline' : 'none';
    },false);

    /*
    * 点击输入框上的“添加”按钮，添加新分类
    */
    submit_new_folder_btn.addEventListener('click',function(e){

      var new_folder_name = new_folder_name_input.value;
      //新节点要插入的容器
      var toBeAddedBox = selected_folder.nextElementSibling;
      //取得父分类文件夹节点的层级
      var parentNodeLevel = parseInt(selected_folder.getAttribute('data-tree-level'));
      //取得父容器的ID
      var parentFolderID = toBeAddedBox.getAttribute('data-folder-id');

      var newNodeLevel = parentNodeLevel + 1;
      
      //渲染节点
      paintFolderNode(new_folder_name, toBeAddedBox, 0, newNodeLevel);
      //将数据存入localStorage
      var newFolderItem = {
        name: new_folder_name,
        parentFolderID: parentFolderID,
        num: 0,
        level: newNodeLevel
      };
      toDoStorage.addItem('folder', newFolderItem);
      add_folder_form.style.display = 'none';
      new_folder_name_input.value = '';

    },false);

    /*
    * 点击表单的关闭按钮，关闭表单并且清空用户的输入数据
    */
    close_add_folder_form.addEventListener('click',function(){
      add_folder_form.style.display = 'none';
      new_folder_name_input.value = '';
    }), false;
    
    
//-------------------   End Event Handlers  ----------------------
  
//===================    End Category Module  ===================  
   
   
//===================  Begin Task Module  ======================
   
//-------------------   Begin DOM Method  ------------------------

  var task_type_area = document.querySelector('.task-type-area');
  var active_underline = document.querySelector('.active-underline');
  var add_new_task_btn = document.querySelector('.todo-shell-task-add-btn');
  var task_edit_btn = document.querySelector('.edit-btn');

  //展示任务‘表单’元素
  var info_display_area = document.querySelector('#info-display-area');
  var display_task_name = info_display_area.querySelector('.task-name'); 
  var display_affiliated_folder = info_display_area.querySelector('.affiliated-folder-name');
  var display_task_ddl = info_display_area.querySelector('.task-ddl');
  var display_task_info = info_display_area.querySelector('.display-content-area');  
  //编辑任务表单元素
  var info_edit_area = document.querySelector('#info-edit-area');
  var edit_task_name_input = info_edit_area.querySelector('#new-task-name'); 
  var edit_affiliated_folder_select = info_edit_area.querySelector('#new-affiliated-folder');
  var edit_task_ddl_input = info_edit_area.querySelector('#new-task-ddl');
  var edit_task_info_textarea = info_edit_area.querySelector('#task-info-input');
  var submit_task_info_btn = info_edit_area.querySelector('.ok');
  var cancel_task_info_btn = info_edit_area.querySelector('.cancel');
  
  //任务分类All,todo,done
  task_type_area.addEventListener('click', function (e) { 
    
    var size = parseInt(getComputedStyle(this, null).getPropertyValue('width')) / 3;
    var targetIndex = parseInt(e.target.getAttribute('data-index'));
    var movingDistance = (targetIndex * size + 16 ) + 'px';
    active_underline.style.left = movingDistance;
    //切换这里有BUG
    paintTaskNodeOfTypeColumn(e.target.innerHTML);
        
  }, false)

  add_new_task_btn.addEventListener('click',function(){

      info_edit_area.style.display = 'block';
      info_display_area.style.display = 'none';

  },false)

  submit_task_info_btn.addEventListener('click',function(){

    //将用户输入的数据取出并存入localStorage
    var name = edit_task_name_input.value;
    var parentFolderID = edit_affiliated_folder_select.value;
    var ddl = edit_task_ddl_input.value;
    var info = edit_task_info_textarea.value;

    var new_task_obj = newTaskInfoCheckandFormatted(name, ddl, parentFolderID, info);
    if (!new_task_obj) return;
    
    toDoStorage.addItem('task', new_task_obj);
    
    var toBeAddedFolder = document.querySelector('[data-folder-id=' + parentFolderID + ']');
    paintTaskNodeInFolder(name, toBeAddedFolder);

    display_task_name.innerHTML = name;
    display_task_ddl.innerHTML = ddl;
    display_affiliated_folder.innerHTML = parentFolderID;
    display_task_info.innerHTML = info;   
    info_edit_area.style.display = 'none';
    info_display_area.style.display = 'block';


  },false)


})();