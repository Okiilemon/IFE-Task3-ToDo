var category = (function(){

  //----------   Begin Module Scope Variables  ------------
  var height_per_item = 29;
  var folder_tmpl = 
  '<div class="folder-name-box" data-folder-selected="false">'
  + '<i class="fa fa-folder"></i>'
  + '<i class="fa fa-folder-open-o"></i>'
  + '<span class="folder-name"></span>'
  + '(<span class="task-num">0</span>)'
  + '</div>'
  + '<ul class="task-items" data-is-opened="false"></ul>'

        
  //----------   End Module Scope Variables  --------------

  //----------   Begin Utilty Method  ---------------------

  /*
  * 控制下拉列表动画
  */
  var dropDownList = function(taskFolder){
    var taskItems = taskFolder.querySelector('.task-items');
    var num_of_items = taskItems.querySelectorAll('li').length;
    var open_folder_icon = taskFolder.querySelector('.fa-folder-open-o');
    var close_folder_icon = taskFolder.querySelector('.fa-folder');
    var is_opened = taskItems.getAttribute('data-is-opened');
      if(is_opened == 'true'){
        taskItems.style.maxHeight = '';
        close_folder_icon.style.display = 'inline';
        open_folder_icon.style.display = 'none';
        taskItems.setAttribute('data-is-opened','false');
      }
      else {
        taskItems.style.maxHeight = num_of_items * height_per_item + 'px';
        close_folder_icon.style.display = 'none';
        open_folder_icon.style.display = 'inline';
        taskItems.setAttribute('data-is-opened','true');

      }
    };

    var changeHeightOfItemsBox = function(changeType,newFolder){
      var item_boxes = document.querySelectorAll('.task-items');
      var lenOfFolders = item_boxes.length;
      var i,current_box_height;

      for(i=0; i<lenOfFolders; i++){
        if(item_boxes[i].contains(newFolder)){
          var current_Box_Height = parseInt(window.getComputedStyle(item_boxes[i],null).getPropertyValue('max-height'));
          if(changeType){
            item_boxes[i].style.maxHeight = current_Box_Height + height_per_item + 'px';
          }
          else{
            item_boxes[i].style.maxHeight = current_Box_Height - height_per_item + 'px';
          }
        }
      }
    };

  //----------   End Utilty Method  -----------------------

  //----------   Begin DOM Method  ------------------------

  var task_total_num = document.querySelector('#task-total-num');
  var all_folders_zone = document.querySelector('.todo-shell-category');
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
      var items = this.querySelectorAll('.item');
      var folder_name_boxes = this.querySelectorAll('.folder-name-box');
      lenOfFolders = folder_name_boxes.length;
      lenOfItems = items.length;
      // 当点击的区域属于某个任务 item
      if(e.target.className == 'item' || e.target.parentElement.className == 'item'){
        for(j=0; j<lenOfItems; j++){
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
        var parent = e.target.parentElement.parentElement.parentElement;
        var target = e.target.parentElement.parentElement;
        parent.removeChild(target);
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
            if(i){ //否则当点击'分类列表’这个特殊folder的时候第一个task-items会出现下拉效果
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
      //当前容器的高度，如果不动态增加这个高度，除非用户点击父节点下拉，新节点不能立即显示在页面中

      //创建待添加的新分类节点
      var toBeAddedFolder = document.createElement('li');
      toBeAddedFolder.setAttribute('data-has-child','false');
      toBeAddedFolder.className = 'task-folder';
      toBeAddedFolder.innerHTML = folder_tmpl;
      //将用户输入的新分类名称填入
      toBeAddedFolder.querySelector('.folder-name').innerHTML = new_folder_name;
      toBeAddedBox.appendChild(toBeAddedFolder);
      changeHeightOfItemsBox(true,toBeAddedFolder);
      add_folder_form.style.display = 'none';
      new_folder_name_input.value = '';
    },false);

    /*
    * 点击表单的关闭按钮，关闭表单并且清空用户的输入数据
    */
    close_add_folder_form.addEventListener('click',function(){
      add_folder_form.style.display = 'none';
      new_folder_name_input.value = '';
    }),false;



  //----------   End Event Handlers  ----------------------

  //----------   Begin Public Method  ---------------------
  //----------   End Public Method  -----------------------

})();