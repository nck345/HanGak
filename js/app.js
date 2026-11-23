const HanGakApp = {
	activeTab: 'glossing',

	init(){
		this.bindTabNavigation();
		if(window.HanGakGlossing) HanGakGlossing.init();
		if(window.HanGakDictation) HanGakDictation.init();
	},

	bindTabNavigation(){
		const tabBtns = document.querySelectorAll('.nav-tab-btn');
		tabBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				const target = btn.dataset.tab;
				this.switchTab(target);
			});
		});
	},

	switchTab(tabId){
		this.activeTab = tabId;
		const tabBtns = document.querySelectorAll('.nav-tab-btn');
		tabBtns.forEach(btn => {
			if(btn.dataset.tab === tabId){
				btn.classList.add('border-indigo-600', 'text-indigo-600', 'bg-indigo-50/60');
				btn.classList.remove('border-transparent', 'text-slate-600', 'hover:text-slate-900');
			}else{
				btn.classList.remove('border-indigo-600', 'text-indigo-600', 'bg-indigo-50/60');
				btn.classList.add('border-transparent', 'text-slate-600', 'hover:text-slate-900');
			}
		});

		const contentGlossing = document.getElementById('tab-glossing');
		const contentDictation = document.getElementById('tab-dictation');

		if(tabId === 'glossing'){
			if(contentGlossing) contentGlossing.classList.remove('hidden');
			if(contentDictation) contentDictation.classList.add('hidden');
		}else if(tabId === 'dictation'){
			if(contentGlossing) contentGlossing.classList.add('hidden');
			if(contentDictation) contentDictation.classList.remove('hidden');
			const wordInput = document.getElementById('input-dictation-word');
			if(wordInput) wordInput.focus();
		}
	}
};

window.HanGakApp = HanGakApp;
document.addEventListener('DOMContentLoaded', () => {
	HanGakApp.init();
});
