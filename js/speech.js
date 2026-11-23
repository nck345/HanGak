const SpeechEngine = {
	voices: [],
	isSpeaking: false,
	activeAudio: null,

	init(){
		if(typeof window !== 'undefined' && 'speechSynthesis' in window){
			this.loadVoices();
			window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
		}
	},

	loadVoices(){
		this.voices = window.speechSynthesis.getVoices();
	},

	getKoreanVoices(){
		if(!this.voices || this.voices.length === 0){
			this.voices = window.speechSynthesis.getVoices();
		}
		return this.voices.filter(v => v.lang && (v.lang === 'ko-KR' || v.lang.startsWith('ko')));
	},

	getBestSentenceVoice(){
		const krVoices = this.getKoreanVoices();
		if(krVoices.length === 0) return null;
		const neural = krVoices.find(v => {
			const name = v.name.toLowerCase();
			return name.includes('natural') || name.includes('neural') || name.includes('online');
		});
		if(neural) return neural;
		const sunhi = krVoices.find(v => v.name.includes('SunHi') || v.name.includes('Heami'));
		if(sunhi) return sunhi;
		const google = krVoices.find(v => v.name.includes('Google'));
		if(google) return google;
		return krVoices[0];
	},

	getBestWordVoice(){
		const krVoices = this.getKoreanVoices();
		if(krVoices.length === 0) return null;
		return krVoices[0];
	},

	stopAll(){
		if(window.speechSynthesis){
			window.speechSynthesis.cancel();
		}
		if(this.activeAudio){
			this.activeAudio.pause();
			this.activeAudio = null;
		}
		this.isSpeaking = false;
	},

	speakWord(word, onStart, onEnd){
		this.stopAll();
		if(!word) return;
		if('speechSynthesis' in window){
			const utterance = new SpeechSynthesisUtterance(word);
			utterance.lang = 'ko-KR';
			const v = this.getBestWordVoice();
			if(v) utterance.voice = v;
			utterance.rate = 0.88;
			utterance.pitch = 1.0;
			utterance.onstart = () => {
				this.isSpeaking = true;
				if(onStart) onStart();
			};
			utterance.onend = () => {
				this.isSpeaking = false;
				if(onEnd) onEnd();
			};
			utterance.onerror = () => {
				this.isSpeaking = false;
				this.fallbackOnlineTTS(word, onStart, onEnd);
			};
			window.speechSynthesis.speak(utterance);
		}else{
			this.fallbackOnlineTTS(word, onStart, onEnd);
		}
	},

	speakSentence(sentence, onStart, onEnd){
		this.stopAll();
		if(!sentence) return;
		if('speechSynthesis' in window){
			const utterance = new SpeechSynthesisUtterance(sentence);
			utterance.lang = 'ko-KR';
			const bestVoice = this.getBestSentenceVoice();
			if(bestVoice) utterance.voice = bestVoice;
			utterance.rate = 0.92;
			utterance.pitch = 1.05;
			utterance.onstart = () => {
				this.isSpeaking = true;
				if(onStart) onStart();
			};
			utterance.onend = () => {
				this.isSpeaking = false;
				if(onEnd) onEnd();
			};
			utterance.onerror = () => {
				this.isSpeaking = false;
				this.fallbackOnlineTTS(sentence, onStart, onEnd);
			};
			window.speechSynthesis.speak(utterance);
		}else{
			this.fallbackOnlineTTS(sentence, onStart, onEnd);
		}
	},

	fallbackOnlineTTS(text, onStart, onEnd){
		try{
			const enc = encodeURIComponent(text);
			const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${enc}&tl=ko&client=tw-ob`;
			const audio = new Audio(url);
			this.activeAudio = audio;
			audio.onplay = () => {
				this.isSpeaking = true;
				if(onStart) onStart();
			};
			audio.onended = () => {
				this.isSpeaking = false;
				this.activeAudio = null;
				if(onEnd) onEnd();
			};
			audio.onerror = () => {
				this.isSpeaking = false;
				this.activeAudio = null;
				if(onEnd) onEnd();
			};
			audio.play().catch(e => {
				this.isSpeaking = false;
				if(onEnd) onEnd();
			});
		}catch(err){
			this.isSpeaking = false;
			if(onEnd) onEnd();
		}
	}
};

window.HanGakSpeech = SpeechEngine;
SpeechEngine.init();
