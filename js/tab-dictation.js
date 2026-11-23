const TabDictation = {
	videoEl: null,
	segments: [],
	currentSegIndex: 0,
	currentWordIndex: 0,
	targetWords: [],
	isSegmentPlaying: false,
	segmentCheckInterval: null,
	isSegmentCompleted: false,

	init(){
		this.videoEl = document.getElementById('dictation-video');
		this.segments = HanGakData.SAMPLE_VIDEO_DATA.segments;
		this.bindEvents();
		this.loadSegment(0);
	},

	bindEvents(){
		const replayBtn = document.getElementById('btn-replay-segment');
		const prevBtn = document.getElementById('btn-prev-segment');
		const nextBtn = document.getElementById('btn-next-segment');
		const checkWordBtn = document.getElementById('btn-check-word');
		const hintBtn = document.getElementById('btn-word-hint');
		const skipWordBtn = document.getElementById('btn-skip-word');
		const wordInput = document.getElementById('input-dictation-word');
		const pushToTab1Btn = document.getElementById('btn-push-to-tab1');
		const continueNextBtn = document.getElementById('btn-continue-next-segment');
		const customVideoFile = document.getElementById('input-custom-video');
		const customSubFile = document.getElementById('input-custom-sub');
		const ttsListenBtn = document.getElementById('btn-segment-tts');

		if(this.videoEl){
			this.videoEl.addEventListener('timeupdate', () => {
				this.onTimeUpdate();
			});
			this.videoEl.addEventListener('ended', () => {
				this.isSegmentPlaying = false;
			});
		}

		if(replayBtn){
			replayBtn.addEventListener('click', () => this.replayCurrentSegment());
		}

		if(prevBtn){
			prevBtn.addEventListener('click', () => {
				if(this.currentSegIndex > 0){
					this.loadSegment(this.currentSegIndex - 1);
				}
			});
		}

		if(nextBtn){
			nextBtn.addEventListener('click', () => {
				if(this.currentSegIndex < this.segments.length - 1){
					this.loadSegment(this.currentSegIndex + 1);
				}
			});
		}

		if(checkWordBtn){
			checkWordBtn.addEventListener('click', () => this.checkCurrentWord());
		}

		if(hintBtn){
			hintBtn.addEventListener('click', () => this.showWordHint());
		}

		if(skipWordBtn){
			skipWordBtn.addEventListener('click', () => this.skipCurrentWord());
		}

		if(wordInput){
			wordInput.addEventListener('keydown', (e) => {
				if(e.key === ' ' || e.key === 'Enter'){
					e.preventDefault();
					this.checkCurrentWord();
				}
			});
		}

		if(pushToTab1Btn){
			pushToTab1Btn.addEventListener('click', () => {
				const seg = this.getCurrentSegment();
				if(!seg) return;
				if(window.HanGakApp && window.HanGakApp.switchTab){
					window.HanGakApp.switchTab('glossing');
				}
				if(window.HanGakGlossing && window.HanGakGlossing.analyzeText){
					window.HanGakGlossing.analyzeText(seg.koreanText);
				}
			});
		}

		if(continueNextBtn){
			continueNextBtn.addEventListener('click', () => {
				if(this.currentSegIndex < this.segments.length - 1){
					this.loadSegment(this.currentSegIndex + 1);
				}
			});
		}

		if(ttsListenBtn){
			ttsListenBtn.addEventListener('click', () => {
				const seg = this.getCurrentSegment();
				if(seg) HanGakSpeech.speakSentence(seg.koreanText);
			});
		}

		if(customVideoFile){
			customVideoFile.addEventListener('change', (e) => {
				const file = e.target.files[0];
				if(file && this.videoEl){
					const url = URL.createObjectURL(file);
					this.videoEl.src = url;
					this.videoEl.load();
					const label = document.getElementById('custom-video-filename');
					if(label) label.textContent = file.name;
					this.loadSegment(0);
				}
			});
		}

		if(customSubFile){
			customSubFile.addEventListener('change', (e) => {
				const file = e.target.files[0];
				if(file){
					const reader = new FileReader();
					reader.onload = (event) => {
						const text = event.target.result;
						const parsed = this.parseSubtitleContent(file.name, text);
						if(parsed && parsed.length > 0){
							this.segments = parsed;
							this.currentSegIndex = 0;
							const label = document.getElementById('custom-sub-filename');
							if(label) label.textContent = `${file.name} (${parsed.length} câu)`;
							this.loadSegment(0);
						}else{
							alert('Không thể phân tích định dạng phụ đề. Vui lòng kiểm tra lại file .json, .srt hoặc .vtt.');
						}
					};
					reader.readAsText(file);
				}
			});
		}

		document.addEventListener('keydown', (e) => {
			const activeTab = document.querySelector('.tab-content:not(.hidden)');
			if(!activeTab || activeTab.id !== 'tab-dictation') return;
			if(e.code === 'F2' || (e.ctrlKey && e.code === 'Space')){
				e.preventDefault();
				this.replayCurrentSegment();
			}
		});
	},

	getCurrentSegment(){
		return this.segments[this.currentSegIndex] || null;
	},

	loadSegment(index){
		if(index < 0 || index >= this.segments.length) return;
		this.currentSegIndex = index;
		this.currentWordIndex = 0;
		this.isSegmentCompleted = false;

		const seg = this.segments[index];
		this.targetWords = this.splitSentenceIntoWords(seg.koreanText);

		document.getElementById('seg-indicator').textContent = `Đoạn ${index + 1} / ${this.segments.length}`;
		document.getElementById('seg-time-range').textContent = `${this.formatTime(seg.startTime)} - ${this.formatTime(seg.endTime)}`;
		document.getElementById('seg-speaker-name').textContent = seg.speaker || 'Nhân vật';

		const prevBtn = document.getElementById('btn-prev-segment');
		const nextBtn = document.getElementById('btn-next-segment');
		if(prevBtn) prevBtn.disabled = (index === 0);
		if(nextBtn) nextBtn.disabled = (index === this.segments.length - 1);

		const successBanner = document.getElementById('segment-success-banner');
		if(successBanner) successBanner.classList.add('hidden');

		const wordInput = document.getElementById('input-dictation-word');
		if(wordInput){
			wordInput.value = '';
			wordInput.disabled = false;
			wordInput.placeholder = 'Gõ từ hiện tại rồi bấm Space hoặc Enter...';
			wordInput.focus();
		}

		const feedback = document.getElementById('word-feedback-msg');
		if(feedback) feedback.textContent = '';

		this.renderWordSlots();
		this.replayCurrentSegment();
	},

	splitSentenceIntoWords(text){
		const rawWords = text.trim().split(/\s+/);
		return rawWords.map((raw, idx) => {
			const clean = this.normalizeWord(raw);
			return {
				id: idx,
				raw: raw,
				clean: clean,
				status: 'pending'
			};
		});
	},

	normalizeWord(word){
		return word.replace(/[^\p{L}\p{N}]+/gu, '').trim();
	},

	renderWordSlots(){
		const container = document.getElementById('dictation-word-slots');
		if(!container) return;
		container.innerHTML = '';

		this.targetWords.forEach((item, idx) => {
			const slot = document.createElement('div');
			slot.id = `word-slot-${idx}`;
			slot.className = 'word-slot min-w-[70px] sm:min-w-[90px] h-14 px-3 rounded-xl flex flex-col items-center justify-center font-bold text-base sm:text-lg border-2 transition-all duration-200 select-none shadow-sm';

			if(item.status === 'completed'){
				slot.classList.add('bg-emerald-500', 'border-emerald-600', 'text-white', 'scale-105');
				slot.innerHTML = `
					<span>${item.raw}</span>
					<span class="text-[10px] text-emerald-100 flex items-center gap-0.5"><svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg> Đúng</span>
				`;
			}else if(idx === this.currentWordIndex){
				slot.classList.add('bg-white', 'border-indigo-500', 'text-indigo-600', 'ring-4', 'ring-indigo-100', 'animate-pulse');
				slot.innerHTML = `
					<span class="text-slate-300">___</span>
					<span class="text-[10px] text-indigo-500 uppercase tracking-wider font-semibold">Từ ${idx + 1}</span>
				`;
			}else{
				slot.classList.add('bg-slate-50', 'border-slate-200', 'text-slate-400');
				slot.innerHTML = `
					<span class="text-slate-300">...</span>
					<span class="text-[10px] text-slate-400 font-medium">${idx + 1}</span>
				`;
			}

			container.appendChild(slot);
		});
	},

	checkCurrentWord(){
		if(this.isSegmentCompleted) return;
		const inputEl = document.getElementById('input-dictation-word');
		const feedbackEl = document.getElementById('word-feedback-msg');
		if(!inputEl) return;

		const userTyped = inputEl.value.trim();
		if(!userTyped) return;

		const target = this.targetWords[this.currentWordIndex];
		if(!target) return;

		const cleanTyped = this.normalizeWord(userTyped);
		const cleanTarget = target.clean;

		if(cleanTyped === cleanTarget){
			target.status = 'completed';
			inputEl.value = '';
			if(feedbackEl){
				feedbackEl.className = 'text-xs text-emerald-600 font-medium flex items-center gap-1';
				feedbackEl.innerHTML = `<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Chính xác! Rất tốt.`;
			}
			this.currentWordIndex++;
			this.renderWordSlots();

			if(this.currentWordIndex >= this.targetWords.length){
				this.onSegmentFinished();
			}else{
				inputEl.focus();
			}
		}else{
			const slotEl = document.getElementById(`word-slot-${this.currentWordIndex}`);
			if(slotEl){
				slotEl.classList.add('bg-rose-50', 'border-rose-500', 'animate-bounce');
				setTimeout(() => {
					slotEl.classList.remove('bg-rose-50', 'border-rose-500', 'animate-bounce');
				}, 600);
			}
			if(feedbackEl){
				feedbackEl.className = 'text-xs text-rose-600 font-medium flex items-center gap-1';
				feedbackEl.innerHTML = `<svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Chưa đúng, hãy nghe lại hoặc sửa lại từ này nhé!`;
			}
			inputEl.select();
		}
	},

	showWordHint(){
		const target = this.targetWords[this.currentWordIndex];
		const feedbackEl = document.getElementById('word-feedback-msg');
		if(!target || !feedbackEl) return;

		const firstChar = target.clean ? target.clean[0] : '';
		const charCount = target.clean ? target.clean.length : 0;
		feedbackEl.className = 'text-xs text-amber-700 font-medium bg-amber-50 p-2 rounded border border-amber-200';
		feedbackEl.innerHTML = `Gợi ý: Từ này có <b>${charCount}</b> âm tiết, bắt đầu bằng chữ '<b>${firstChar}</b>'. Từ đầy đủ: <i>[${target.clean}]</i>`;
	},

	skipCurrentWord(){
		const target = this.targetWords[this.currentWordIndex];
		if(!target) return;
		target.status = 'completed';
		const inputEl = document.getElementById('input-dictation-word');
		if(inputEl) inputEl.value = '';
		this.currentWordIndex++;
		this.renderWordSlots();

		if(this.currentWordIndex >= this.targetWords.length){
			this.onSegmentFinished();
		}else{
			if(inputEl) inputEl.focus();
		}
	},

	onSegmentFinished(){
		this.isSegmentCompleted = true;
		const seg = this.getCurrentSegment();
		const banner = document.getElementById('segment-success-banner');
		const inputEl = document.getElementById('input-dictation-word');
		if(inputEl) inputEl.disabled = true;

		if(banner && seg){
			document.getElementById('success-korean-text').textContent = seg.koreanText;
			document.getElementById('success-vietnamese-text').textContent = seg.vietnameseMeaning;
			banner.classList.remove('hidden');
		}

		HanGakSpeech.speakSentence(seg.koreanText);
	},

	replayCurrentSegment(){
		const seg = this.getCurrentSegment();
		if(!seg || !this.videoEl) return;

		this.videoEl.currentTime = seg.startTime;
		this.isSegmentPlaying = true;
		this.videoEl.play().catch(e => {
			console.log('Play prevented or pending user interaction:', e);
		});
	},

	onTimeUpdate(){
		if(!this.isSegmentPlaying || !this.videoEl) return;
		const seg = this.getCurrentSegment();
		if(!seg) return;

		if(this.videoEl.currentTime >= seg.endTime){
			this.videoEl.pause();
			this.isSegmentPlaying = false;
			this.videoEl.currentTime = seg.endTime;
		}
	},

	formatTime(sec){
		if(isNaN(sec)) return '00:00.0';
		const mins = Math.floor(sec / 60);
		const s = sec % 60;
		return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
	},

	parseSubtitleContent(filename, text){
		if(filename.endsWith('.json')){
			try{
				const data = JSON.parse(text);
				if(Array.isArray(data)){
					return data.map((item, idx) => ({
						id: item.id || idx + 1,
						startTime: parseFloat(item.start_time || item.startTime || 0),
						endTime: parseFloat(item.end_time || item.endTime || 0),
						speaker: item.speaker || `Đoạn ${idx + 1}`,
						koreanText: item.korean_text || item.koreanText || '',
						vietnameseMeaning: item.vietnamese_meaning || item.vietnameseMeaning || ''
					}));
				}
			}catch(e){
				console.error(e);
				return null;
			}
		}
		if(filename.endsWith('.srt') || filename.endsWith('.vtt')){
			return this.parseSrtOrVtt(text);
		}
		return null;
	},

	parseSrtOrVtt(content){
		const blocks = content.replace(/\r/g, '').split(/\n\n+/);
		const result = [];
		let idCounter = 1;

		blocks.forEach(block => {
			const lines = block.trim().split('\n');
			if(lines.length < 2) return;
			let timeLine = '';
			let textLines = [];

			lines.forEach(l => {
				if(l.includes('-->')){
					timeLine = l;
				}else if(!isNaN(l) && textLines.length === 0 && !timeLine){
				}else if(l.trim() && !l.startsWith('WEBVTT')){
					textLines.push(l.trim());
				}
			});

			if(timeLine && textLines.length > 0){
				const times = timeLine.split('-->');
				if(times.length === 2){
					const start = this.parseTimestamp(times[0].trim());
					const end = this.parseTimestamp(times[1].trim());
					let korean = textLines[0];
					let vietnamese = textLines[1] || '';
					let speaker = 'Hội thoại';

					if(korean.includes(':')){
						const parts = korean.split(':');
						speaker = parts[0].trim();
						korean = parts.slice(1).join(':').trim();
					}

					result.push({
						id: idCounter++,
						startTime: start,
						endTime: end,
						speaker: speaker,
						koreanText: korean,
						vietnameseMeaning: vietnamese
					});
				}
			}
		});

		return result.length > 0 ? result : null;
	},

	parseTimestamp(str){
		const clean = str.replace(',', '.');
		const parts = clean.split(':');
		let sec = 0;
		if(parts.length === 3){
			sec = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
		}else if(parts.length === 2){
			sec = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
		}else{
			sec = parseFloat(clean);
		}
		return isNaN(sec) ? 0 : sec;
	}
};

window.HanGakDictation = TabDictation;
