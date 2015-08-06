localStorage.setItem('folder',
	'[{"name":"bbb","parentID":"root"},{"name":"ccc","parentID":"root"},{"name":"aaa","parentID":"root"},{"name":"fff","parentID":"aaa"},{"name":"ddd","parentID":"fff"}]');

/*
 * @param
 * folderListArr {array} 列表对象数组
 * lenOfFolders {num} 列表对象数组长度
 * parentFolderID {string} 当前作为父分类列表节点的ID，也就是name
 * parentFolderNode {object node} 当前作为父容器节点的节点
*/
var paintNestedFolderTree = function (folderListsArr, lenOfFolders, parentFolderID, parentFolderNode) {
	var i;
	for (i = 0; i < lenOfFolders; i++) {
		if (folderListsArr[i].parentID === parentFolderID) {

			var childFolderNode = document.createElement('li');
			childFolderNode.className = 'task-folder';
			childFolderNode.innerHTML =
			'<div class="folder-name-box" data-folder-selected="false">'+
				'<i class="fa fa-folder"></i>'+
				'<i class="fa fa-folder-open-o"></i>'+
				'<span class="folder-name">' + folderListsArr[i].name + '</span>' +
				'  (<span class="task-num"></span>)' +
				'<i class="fa fa-close"></i>' +
			'</div>';
			var container = document.createElement('ul');
			container.className = 'task-items-box';
			container.setAttribute('data-folder-id', folderListsArr[i].name);
			childFolderNode.appendChild(container);
			parentFolderNode.appendChild(childFolderNode);

			paintNestedFolderTree(folderListsArr, lenOfFolders, folderListsArr[i].name, container);
		}
	}
};

var beginPaint = (function () {
	var folderListArr = toDoStorage.getItemListArray('folder');
	var lenOfFolders = folderListArr.length;
	var root = document.querySelector('[data-folder-id="root"]');
	paintNestedFolderTree(folderListArr, lenOfFolders, 'root', root);
})();
