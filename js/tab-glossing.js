const TabGlossing = {
	currentSentence: '',
	currentTokens: [],
	activeTokenIndex: null,
	pinnedTokenIndex: null,

	init(){
		this.bindEvents();
		this.renderSamplePills();
		this.renderLegend();
		const defaultSentence = HanGakData.SAMPLE_SENTENCES[0].text;
		this.analyzeText(defaultSentence);
	},

	bindEvents(){
		const analyzeBtn = document.getElementById('btn-analyze-sentence');
		const speakBtn = document.getElementById('btn-speak-sentence');
		const clearBtn = document.getElementById('btn-clear-sentence');
		const inputArea = document.getElementById('input-korean-text');

		if(analyzeBtn){
			analyzeBtn.addEventListener('click', () => {
				const val = inputArea.value.trim();
				if(val) this.analyzeText(val);
			});
		}

		if(speakBtn){
			speakBtn.addEventListener('click', () => {
				const val = inputArea.value.trim() || this.currentSentence;
				if(!val) return;
				speakBtn.classList.add('animate-pulse', 'ring-2', 'ring-indigo-400');
				HanGakSpeech.speakSentence(
					val,
					() => {
						speakBtn.classList.add('bg-indigo-700');
					},
					() => {
						speakBtn.classList.remove('animate-pulse', 'ring-2', 'ring-indigo-400', 'bg-indigo-700');
					}
				);
			});
		}

		if(clearBtn){
			clearBtn.addEventListener('click', () => {
				inputArea.value = '';
				inputArea.focus();
			});
		}

		inputArea.addEventListener('keydown', (e) => {
			if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
				e.preventDefault();
				const val = inputArea.value.trim();
				if(val) this.analyzeText(val);
			}
		});

		document.addEventListener('click', (e) => {
			const popover = document.getElementById('word-popover');
			if(popover && !popover.classList.contains('hidden')){
				const isInsidePopover = popover.contains(e.target);
				const isWordSpan = e.target.closest('.gloss-token');
				if(!isInsidePopover && !isWordSpan){
					this.hidePopover();
				}
			}
		});

		window.addEventListener('resize', () => {
			if(this.activeTokenIndex !== null){
				this.repositionPopover();
			}
		});
	},

	renderSamplePills(){
		const container = document.getElementById('sample-sentences-list');
		if(!container) return;
		container.innerHTML = '';
		HanGakData.SAMPLE_SENTENCES.forEach((item, idx) => {
			const pill = document.createElement('button');
			pill.type = 'button';
			pill.className = 'text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 font-medium transition flex items-center gap-1.5';
			pill.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span>${item.title}</span>`;
			pill.title = item.text;
			pill.addEventListener('click', () => {
				const inputArea = document.getElementById('input-korean-text');
				inputArea.value = item.text;
				this.analyzeText(item.text);
			});
			container.appendChild(pill);
		});
	},

	renderLegend(){
		const container = document.getElementById('pos-legend-bar');
		if(!container) return;
		container.innerHTML = '';
		const keys = ['noun', 'verb', 'adj', 'particle', 'adverb', 'pronoun', 'conj', 'num', 'interj'];
		keys.forEach(k => {
			const conf = HanGakNLP.POS_CONFIG[k];
			if(!conf) return;
			const item = document.createElement('div');
			item.className = 'flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs shadow-sm cursor-pointer hover:border-slate-400 transition';
			item.innerHTML = `
				<span class="w-3.5 h-3.5 rounded-full inline-block" style="background-color: ${conf.color};"></span>
				<span class="font-medium text-slate-700">${conf.label}</span>
			`;
			item.title = conf.description;
			item.addEventListener('click', () => {
				this.highlightPOS(k);
			});
			container.appendChild(item);
		});
	},

	highlightPOS(posKey){
		const spans = document.querySelectorAll('.gloss-token');
		spans.forEach(s => {
			if(s.dataset.pos === posKey){
				s.classList.add('ring-4', 'ring-amber-300', 'bg-amber-100');
				setTimeout(() => {
					s.classList.remove('ring-4', 'ring-amber-300', 'bg-amber-100');
				}, 1500);
			}
		});
	},

	analyzeText(text){
		this.currentSentence = text;
		const inputArea = document.getElementById('input-korean-text');
		if(inputArea) inputArea.value = text;
		this.currentTokens = HanGakNLP.analyzeKoreanSentence(text);
		this.renderAnalyzedSentence();
		this.renderSidebarSummary();
		this.hidePopover();
	},

	renderAnalyzedSentence(){
		const container = document.getElementById('sentence-gloss-output');
		if(!container) return;
		container.innerHTML = '';

		if(this.currentTokens.length === 0){
			container.innerHTML = '<p class="text-slate-400 italic">Nhập câu tiếng Hàn và bấm "Phân tích" để bắt đầu.</p>';
			return;
		}

		const wrapper = document.createElement('div');
		wrapper.className = 'flex flex-wrap items-center gap-x-3 gap-y-4 text-xl sm:text-2xl font-medium leading-relaxed select-text';

		this.currentTokens.forEach((token, idx) => {
			const conf = HanGakNLP.POS_CONFIG[token.pos] || HanGakNLP.POS_CONFIG.other;

			const tokenSpan = document.createElement('span');
			tokenSpan.className = `gloss-token relative inline-block cursor-pointer px-1.5 py-0.5 rounded transition ${conf.underlineClass}`;
			tokenSpan.dataset.index = idx;
			tokenSpan.dataset.pos = token.pos;

			let htmlContent = '';
			if(token.puncBefore) htmlContent += `<span class="text-slate-400 font-normal">${token.puncBefore}</span>`;
			htmlContent += `<span class="hangul-word font-bold">${token.clean || token.raw}</span>`;
			if(token.puncAfter) htmlContent += `<span class="text-slate-400 font-normal">${token.puncAfter}</span>`;

			tokenSpan.innerHTML = htmlContent;

			tokenSpan.addEventListener('click', (e) => {
				e.stopPropagation();
				this.showPopoverForToken(idx, tokenSpan);
			});

			wrapper.appendChild(tokenSpan);
		});

		container.appendChild(wrapper);
	},

	showPopoverForToken(idx, element){
		this.activeTokenIndex = idx;
		const token = this.currentTokens[idx];
		if(!token) return;

		const popover = document.getElementById('word-popover');
		if(!popover) return;

		const conf = HanGakNLP.POS_CONFIG[token.pos] || HanGakNLP.POS_CONFIG.other;

		document.getElementById('popover-word').textContent = token.clean || token.raw;
		document.getElementById('popover-actual-pron').textContent = `[${token.pronunciation || token.clean}]`;
		document.getElementById('popover-romaja').textContent = token.romaja || '';

		const posBadge = document.getElementById('popover-pos-badge');
		posBadge.textContent = conf.label;
		posBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-semibold border ${conf.badgeClass}`;

		document.getElementById('popover-root').textContent = token.root || token.clean;
		document.getElementById('popover-meaning').textContent = token.meaning || '';
		document.getElementById('popover-note').textContent = token.grammarNote || '';

		const speakBtn = document.getElementById('popover-btn-speak');
		speakBtn.onclick = (e) => {
			e.stopPropagation();
			speakBtn.classList.add('scale-110', 'text-indigo-600');
			HanGakSpeech.speakWord(token.clean, null, () => {
				speakBtn.classList.remove('scale-110', 'text-indigo-600');
			});
		};

		const pinBtn = document.getElementById('popover-btn-pin');
		pinBtn.onclick = (e) => {
			e.stopPropagation();
			this.pinToken(idx);
		};

		const closeBtn = document.getElementById('popover-btn-close');
		closeBtn.onclick = (e) => {
			e.stopPropagation();
			this.hidePopover();
		};

		popover.classList.remove('hidden');
		this.positionPopoverOverElement(popover, element);
	},

	positionPopoverOverElement(popover, element){
		const rect = element.getBoundingClientRect();
		const popRect = popover.getBoundingClientRect();
		const scrollY = window.scrollY || window.pageYOffset;
		const scrollX = window.scrollX || window.pageXOffset;

		let top = rect.top + scrollY - popRect.height - 12;
		let left = rect.left + scrollX + (rect.width / 2) - (popRect.width / 2);

		if(top < scrollY + 10){
			top = rect.bottom + scrollY + 12;
		}
		if(left < 10) left = 10;
		if(left + popRect.width > window.innerWidth - 10){
			left = window.innerWidth - popRect.width - 10;
		}

		popover.style.top = `${top}px`;
		popover.style.left = `${left}px`;
	},

	repositionPopover(){
		const popover = document.getElementById('word-popover');
		if(!popover || popover.classList.contains('hidden')) return;
		const targetSpan = document.querySelector(`.gloss-token[data-index="${this.activeTokenIndex}"]`);
		if(targetSpan){
			this.positionPopoverOverElement(popover, targetSpan);
		}
	},

	hidePopover(){
		const popover = document.getElementById('word-popover');
		if(popover) popover.classList.add('hidden');
		this.activeTokenIndex = null;
	},

	pinToken(idx){
		this.pinnedTokenIndex = idx;
		this.renderSidebarSummary();
		const sidebar = document.getElementById('gloss-sidebar-panel');
		if(sidebar){
			sidebar.classList.add('ring-2', 'ring-indigo-400');
			setTimeout(() => sidebar.classList.remove('ring-2', 'ring-indigo-400'), 1000);
		}
	},

	renderSidebarSummary(){
		const container = document.getElementById('sidebar-token-list');
		if(!container) return;
		container.innerHTML = '';

		if(this.currentTokens.length === 0){
			container.innerHTML = '<p class="text-sm text-slate-400 italic">Chưa có dữ liệu phân tích.</p>';
			return;
		}

		this.currentTokens.forEach((token, idx) => {
			const conf = HanGakNLP.POS_CONFIG[token.pos] || HanGakNLP.POS_CONFIG.other;
			const isPinned = (this.pinnedTokenIndex === idx);

			const card = document.createElement('div');
			card.className = `p-3 rounded-lg border transition ${isPinned ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-400' : 'border-slate-200 bg-white hover:border-slate-300'}`;

			card.innerHTML = `
				<div class="flex items-center justify-between mb-1">
					<div class="flex items-center gap-2">
						<span class="text-base font-bold text-slate-900">${token.clean || token.raw}</span>
						<span class="text-xs px-2 py-0.5 rounded-full font-medium ${conf.badgeClass}">${conf.label}</span>
					</div>
					<button type="button" class="btn-side-speak p-1 text-slate-400 hover:text-indigo-600 rounded transition" title="Nghe từ">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
					</button>
				</div>
				<div class="text-xs text-slate-500 mb-1.5 flex flex-wrap gap-x-2">
					<span>Phát âm: <b class="text-slate-700">[${token.pronunciation || token.clean}]</b></span>
					<span>•</span>
					<span class="text-slate-400">${token.romaja || ''}</span>
				</div>
				<div class="text-xs text-slate-700 mb-1">
					<span class="font-semibold text-slate-600">Từ gốc:</span> <span class="font-bold text-indigo-700">${token.root || token.clean}</span>
				</div>
				<div class="text-xs text-emerald-700 font-medium mb-1">
					${token.meaning || ''}
				</div>
				${token.grammarNote ? `<div class="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">${token.grammarNote}</div>` : ''}
			`;

			const speakBtn = card.querySelector('.btn-side-speak');
			speakBtn.addEventListener('click', () => {
				HanGakSpeech.speakWord(token.clean);
			});

			card.addEventListener('click', (e) => {
				if(e.target.closest('.btn-side-speak')) return;
				const span = document.querySelector(`.gloss-token[data-index="${idx}"]`);
				if(span) this.showPopoverForToken(idx, span);
			});

			container.appendChild(card);
		});
	}
};

window.HanGakGlossing = TabGlossing;
