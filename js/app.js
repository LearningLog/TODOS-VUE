;
(function (window, Vue) {
	// 注册一个全局自定义指令 v-focus
	Vue.directive('focus', {
		inserted: function (el) {
			el.focus()
		}
	})
	// 从本地的存储获取任务列表数据
	const todos = JSON.parse(window.localStorage.getItem('todos')) || [];

	const app = new Vue({
		el: "#todoApp",
		data: {
			todos,
			currentEdit: null,
			filterTodos: [],
			hash: '',
			idCount: localStorage.getItem('idCount') || 0
		},
		methods: {
			// 2.添加任务项
			addTodo(e) {
				e.preventDefault()
				const todos = this.todos;
				const input = e.target;
				const value = input.value;
				todos.title = value;

				// 设置id
				const id = ++this.idCount;
				localStorage.setItem('idCount', this.idCount)

				// 2.2 非空校验
				if (!value.trim()) {
					return
				}
				// 2.3 将新数据添加到数据中
				todos.unshift({
					id,
					title: value,
					done: false
				})
				// 2.4 清空输入框
				input.value = '';
			},

			// 换行
			lineFeed (e) {
				e.preventDefault()
				const input = e.target;
				input.value = input.value + '\n';
			},

			// 3.删除任务项
			// 3.1 绑定点击事件，并将该任务项下标作为参数传入
			removeTodo(item) {
				let r = confirm("确认删除吗？")
				if (r) {
					const index = this.todos.findIndex(function (t) {
						return t.id === item.id
					})
					if (index > -1) {
						// 3.2 删除数组一项数据
						this.todos.splice(index, 1);
					} else {

					}
				}
			},

			// 4.双击编辑任务项
			editTodo(item) {
				// 将一个任务项变量
				this.currentEdit = item
			},

			// 5.输入状态按下 esc 取消编辑
			cancelEdit() {
				this.currentEdit = null;
			},

			// 6.在编辑文本框中敲回车保存编辑
			saveEdit(item, index, e) {
				// 6.1 将编辑好的内容赋值给任务项的title
				const value = e.target.value;
				// 6.2 非空校验
				if (!value.trim()) {
					return
				}
				// 6.3 将编辑好的 input的 value 赋值给 title
				item.title = value;
				// 6.4 退出编辑状态
				this.currentEdit = null;
			},

			// 7.清除所有已完成任务
			clearCompleted() {
				const todos = this.todos;
				// 7.1 倒着遍历任务项
				//  因为for 循环中正向执行删除操作会发生跳项的bug,所以采用从后往前删的方法
				for (var i = todos.length - 1; i >= 0; i--) {
					// 7.2 找到每个已完成的任务项
					if (todos[i].done === true) {
						// 7.3 删除
						todos.splice(i, 1);
					}
				}
			},
		},
		// 计算属性选项对象
		// 计算属性的本质就是带有行为的属性，只能当属性实行，不能调用
		// 计算属性和方法的唯一区别是：
		/**
		 * 计算属性会把计算结果进行缓存，
		 * 如果使用多次该计算属性，实际上只调用了一次
		 * 然而换成方法的话，每使用一次就要调用一次
		 */
		computed: {
			remaining() {
				return this.todos.filter(item => !item.done).length
				// or
				//  return this.todos.filter(function(item) {
				// 	return !item.done
				// }).length
			},

			// 全选切换
			toggleAllAtatus: {
				get: function () {
					// every 方法对每一个元素执行条件判断
					const toggleAll = this.todos.every(function (item) {
						// 如果每个元素.done === true ，every 返回 true
						// 只要有一个元素.done === false ，every 返回 false
						return item.done === true
					})
					return toggleAll
				},
				// 当给 计算属性 = xxx 的时候，会在自动调用这个set方法
				set: function (val) {
					// 遍历所有任务项，将所有任务项的.done = checkbox 的选中状态
					this.todos.forEach(function (item) {
						item.done = val
					})
				}
			}
		},

		// watch 实例选项
		// watch 是一个对象
		// watch 对象的 key 必须是要被监视的实例对象成员（data中的数据成员、计算属性中的成员）
		watch: {
			// 8.将数据持久化到 localStorage 中
			todos: {
				handler: function () { // 当 todos 发生改变的时候，会自动调用 handler 方法
					// 当 todos 发生改变，将 todos 数据同步存储到本地存储中
					window.localStorage.setItem('todos', JSON.stringify(this.todos))
					window.onhashchange()
				},
				deep: true // 默认只能监视对象或者数组的一层数据，如果需要无级后代监视，则需要配置为深度监视
			},
			// todos () { // 默认状态下，只能监视对象或者数组成员的添加或者删除，说白了对象或者数组需要被深度监视才可以
			// 	console.log('todos 发生改变了')
			// }
		},

		// 注册一个局部指令
		directives: {
			'todo-focus': {
				update(el, binding) {
					// 找到双击的 el
					// console.log('update', binding.value)
					if (binding.value === true) {
						el.focus()
					}
				}
			}
		}

	})

	// 将Vue实例app挂载到全局
	window.app = app;

	// 只有锚点发生变化的时候才会调用，如果没有改变则不会调用
	window.onhashchange = function () {
		const {
			hash
		} = window.location;
		// 修饰实例中的属性 hash 从而影响用来过滤数据的 a 链接的样式
		app.hash = hash;
		//根据 hash 的不同过滤数据的展示
		switch (hash) {
			// case '#/':
			// 	app.filterTodos = app.todos;
			// 	break;
			case '#/active':
				app.filterTodos = app.todos.filter(function (item) {
					return item.done === false
				})
				break;
			case '#/completed':
				app.filterTodos = app.todos.filter(function (item) {
					return item.done === true
				})
				break;
			default:
				app.hash = "#/"
				app.filterTodos = app.todos;
				break;
		}
	}
	window.onhashchange('#/')
})(window, Vue);
