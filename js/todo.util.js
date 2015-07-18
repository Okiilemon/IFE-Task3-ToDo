
//每个item或者task的高度
var height_per_item = 29;

/*
* 控制下拉列表动画
*/
var dropDownList = function (taskFolder) {

  var taskItems = taskFolder.querySelector('.task-items');
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
*/
var changeHeightOfItemsBox = function (changeType, newFolder) {
  var item_boxes = document.querySelectorAll('.task-items');
  var lenOfFolders = item_boxes.length;
  var i;

  for (i = 0; i < lenOfFolders; i++) {
    if (item_boxes[i].contains(newFolder)) {
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
 * 参数说明：
 * name:新写入的这个分类列表的名字
 * parentFolderID: 上一级分类文件夹的唯一标示符（文件夹的名字）
 * num: 这个分类列表下任务的个数
 * level: 这个分类列表在嵌套列表树中所处的层级     
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
    + '<ul class="task-items" data-is-opened="false" data-folder-id=' + name + '></ul>';
  //插入DOM
  toBeAddedFolder.innerHTML = folder_tmpl;
  parentFolder.appendChild(toBeAddedFolder);

  changeHeightOfItemsBox(true, toBeAddedFolder);

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