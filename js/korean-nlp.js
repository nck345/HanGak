const CHOSEONG = [
	'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];
const JUNGSEONG = [
	'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
];
const JONGSEONG = [
	'','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

const ROMAJA_CHO = {
	'ㄱ':'g','ㄲ':'kk','ㄴ':'n','ㄷ':'d','ㄸ':'tt','ㄹ':'r','ㅁ':'m','ㅂ':'b','ㅃ':'pp',
	'ㅅ':'s','ㅆ':'ss','ㅇ':'','ㅈ':'j','ㅉ':'jj','ㅊ':'ch','ㅋ':'k','ㅌ':'t','ㅍ':'p','ㅎ':'h'
};
const ROMAJA_JUNG = {
	'ㅏ':'a','ㅐ':'ae','ㅑ':'ya','ㅒ':'yae','ㅓ':'eo','ㅔ':'e','ㅕ':'yeo','ㅖ':'ye',
	'ㅗ':'o','ㅘ':'wa','ㅙ':'wae','ㅚ':'oe','ㅛ':'yo','ㅜ':'u','ㅝ':'wo','ㅞ':'we',
	'ㅟ':'wi','ㅠ':'yu','ㅡ':'eu','ㅢ':'ui','ㅣ':'i'
};
const ROMAJA_JONG = {
	'':'','ㄱ':'k','ㄲ':'k','ㄳ':'k','ㄴ':'n','ㄵ':'n','ㄶ':'n','ㄷ':'t','ㄹ':'l',
	'ㄺ':'k','ㄻ':'m','ㄼ':'p','ㄽ':'t','ㄾ':'t','ㄿ':'p','ㅀ':'l','ㅁ':'m','ㅂ':'p',
	'ㅄ':'p','ㅅ':'t','ㅆ':'t','ㅇ':'ng','ㅈ':'t','ㅊ':'t','ㅋ':'k','ㅌ':'t','ㅍ':'p','ㅎ':'t'
};

function decomposeHangul(char){
	const code = char.charCodeAt(0);
	if(code < 0xAC00 || code > 0xD7A3){
		return {char, isHangul: false};
	}
	const offset = code - 0xAC00;
	const choIdx = Math.floor(offset / (21 * 28));
	const jungIdx = Math.floor((offset % (21 * 28)) / 28);
	const jongIdx = offset % 28;
	return {
		char,
		isHangul: true,
		cho: CHOSEONG[choIdx],
		jung: JUNGSEONG[jungIdx],
		jong: JONGSEONG[jongIdx],
		choIdx,
		jungIdx,
		jongIdx
	};
}

function composeHangul(cho, jung, jong = ''){
	const cIdx = CHOSEONG.indexOf(cho);
	const jIdx = JUNGSEONG.indexOf(jung);
	const gIdx = JONGSEONG.indexOf(jong);
	if(cIdx === -1 || jIdx === -1 || gIdx === -1) return '';
	return String.fromCharCode(0xAC00 + (cIdx * 21 * 28) + (jIdx * 28) + gIdx);
}

function getPhoneticPronunciation(text){
	const decomp = [];
	for(let i=0;i<text.length;++i){
		decomp.push(decomposeHangul(text[i]));
	}
	for(let i=0;i<decomp.length-1;++i){
		const cur = decomp[i];
		const next = decomp[i+1];
		if(!cur.isHangul || !next.isHangul) continue;
		if(cur.jong && next.cho === 'ㅇ'){
			if(cur.jong === 'ㅎ'){
				cur.jong = '';
			}else if(cur.jong === 'ㄶ'){
				cur.jong = 'ㄴ';
			}else if(cur.jong === 'ㅀ'){
				cur.jong = 'ㄹ';
			}else if(cur.jong === 'ㄳ'){
				cur.jong = 'ㄱ';
				next.cho = 'ㅅ';
			}else if(cur.jong === 'ㄵ'){
				cur.jong = 'ㄴ';
				next.cho = 'ㅈ';
			}else if(cur.jong === 'ㄺ'){
				cur.jong = 'ㄹ';
				next.cho = 'ㄱ';
			}else if(cur.jong === 'ㄻ'){
				cur.jong = 'ㄹ';
				next.cho = 'ㅁ';
			}else if(cur.jong === 'ㄼ'){
				cur.jong = 'ㄹ';
				next.cho = 'ㅂ';
			}else if(cur.jong === 'ㅄ'){
				cur.jong = 'ㅂ';
				next.cho = 'ㅅ';
			}else if(cur.jong === 'ㅅ' || cur.jong === 'ㅆ'){
				next.cho = cur.jong;
				cur.jong = '';
			}else{
				next.cho = cur.jong;
				cur.jong = '';
			}
		}else if(cur.jong && next.cho === 'ㅎ'){
			const map = {'ㄱ':'ㅋ','ㄷ':'ㅌ','ㅂ':'ㅍ','ㅈ':'ㅊ'};
			if(map[cur.jong]){
				next.cho = map[cur.jong];
				cur.jong = '';
			}
		}else if(cur.jong === 'ㅎ' && (next.cho === 'ㄱ'||next.cho === 'ㄷ'||next.cho === 'ㅈ')){
			const map = {'ㄱ':'ㅋ','ㄷ':'ㅌ','ㅈ':'ㅊ'};
			next.cho = map[next.cho];
			cur.jong = '';
		}else if((cur.jong === 'ㅂ'||cur.jong === 'ㅍ'||cur.jong === 'ㅄ') && (next.cho === 'ㄴ'||next.cho === 'ㅁ')){
			cur.jong = 'ㅁ';
		}else if((cur.jong === 'ㄱ'||cur.jong === 'ㄲ'||cur.jong === 'ㅋ'||cur.jong === 'ㄺ') && (next.cho === 'ㄴ'||next.cho === 'ㅁ')){
			cur.jong = 'ㅇ';
		}else if((cur.jong === 'ㄷ'||cur.jong === 'ㅅ'||cur.jong === 'ㅆ'||cur.jong === 'ㅈ'||cur.jong === 'ㅊ'||cur.jong === 'ㅌ'||cur.jong === 'ㅎ') && (next.cho === 'ㄴ'||next.cho === 'ㅁ')){
			cur.jong = 'ㄴ';
		}
	}
	let result = '';
	for(let i=0;i<decomp.length;++i){
		const d = decomp[i];
		if(d.isHangul){
			result += composeHangul(d.cho, d.jung, d.jong);
		}else{
			result += d.char;
		}
	}
	return result;
}

function getRomaja(text){
	const phonetic = getPhoneticPronunciation(text);
	let roma = '';
	for(let i=0;i<phonetic.length;++i){
		const d = decomposeHangul(phonetic[i]);
		if(d.isHangul){
			let cho = ROMAJA_CHO[d.cho] || '';
			let jung = ROMAJA_JUNG[d.jung] || '';
			let jong = ROMAJA_JONG[d.jong] || '';
			if(i > 0 && d.cho === 'ㅇ' && d.jong && roma.endsWith('-')){
				roma = roma.slice(0, -1);
			}
			roma += cho + jung + jong;
		}else{
			roma += d.char;
		}
	}
	return roma;
}

const KOREAN_DICT = {
	'안녕하세요': {pos:'interj', root:'안녕하세요', meaning:'Xin chào (chào hỏi lịch sự, thông dụng nhất)', note:'Lời chào trang trọng'},
	'안녕': {pos:'interj', root:'안녕', meaning:'Xin chào, tạm biệt (thân mật)', note:'Dùng với bạn bè, người nhỏ tuổi'},
	'오늘': {pos:'noun', root:'오늘', meaning:'Hôm nay (danh từ chỉ thời gian)', note:'Thời gian hiện tại'},
	'어제': {pos:'noun', root:'어제', meaning:'Hôm qua', note:'Thời gian quá khứ'},
	'내일': {pos:'noun', root:'내일', meaning:'Ngày mai', note:'Thời gian tương lai'},
	'지금': {pos:'noun', root:'지금', meaning:'Bây giờ, lúc này', note:'Hiện tại'},
	'날씨': {pos:'noun', root:'날씨', meaning:'Thời tiết, khí hậu', note:'Danh từ thời tiết'},
	'정말': {pos:'adverb', root:'정말', meaning:'Thật sự, thực sự, quả thực', note:'Phó từ chỉ mức độ'},
	'진짜': {pos:'adverb', root:'진짜', meaning:'Thực sự, thật (dùng trong văn nói)', note:'Phó từ'},
	'아주': {pos:'adverb', root:'아주', meaning:'Rất, vô cùng, cực kỳ', note:'Phó từ nhấn mạnh'},
	'매우': {pos:'adverb', root:'매우', meaning:'Rất, hết sức (văn viết/lịch sự)', note:'Phó từ chỉ mức độ cao'},
	'너무': {pos:'adverb', root:'너무', meaning:'Quá, rất (dùng phổ biến)', note:'Phó từ mức độ'},
	'기분': {pos:'noun', root:'기분', meaning:'Tâm trạng, cảm xúc, cảm giác', note:'Danh từ chỉ tâm lý'},
	'커피': {pos:'noun', root:'커피', meaning:'Cà phê', note:'Từ mượn tiếng Anh'},
	'아메리카노': {pos:'noun', root:'아메리카노', meaning:'Cà phê Americano', note:'Từ mượn tiếng Anh'},
	'물': {pos:'noun', root:'물', meaning:'Nước (đồ uống)', note:'Danh từ sinh hoạt'},
	'음식': {pos:'noun', root:'음식', meaning:'Thức ăn, món ăn', note:'Danh từ ẩm thực'},
	'밥': {pos:'noun', root:'밥', meaning:'Cơm, bữa ăn', note:'Danh từ thiết yếu'},
	'공원': {pos:'noun', root:'공원', meaning:'Công viên', note:'Danh từ địa điểm'},
	'학교': {pos:'noun', root:'학교', meaning:'Trường học', note:'Danh từ địa điểm'},
	'집': {pos:'noun', root:'집', meaning:'Nhà, gia đình', note:'Danh từ nơi chốn'},
	'친구': {pos:'noun', root:'친구', meaning:'Bạn bè, người bạn', note:'Danh từ xưng hô'},
	'선생님': {pos:'noun', root:'선생님', meaning:'Thầy giáo, cô giáo, tiền bối kính trọng', note:'Kính ngữ'},
	'한국': {pos:'noun', root:'한국', meaning:'Hàn Quốc', note:'Danh từ quốc gia'},
	'한국어': {pos:'noun', root:'한국어', meaning:'Tiếng Hàn Quốc', note:'Danh từ ngôn ngữ'},
	'드라마': {pos:'noun', root:'드라마', meaning:'Phim truyền hình (drama)', note:'Từ mượn'},
	'생각': {pos:'noun', root:'생각', meaning:'Suy nghĩ, ý kiến, ý tưởng', note:'Danh từ tư duy'},
	'사람': {pos:'noun', root:'사람', meaning:'Người, con người', note:'Danh từ nhân chủng'},
	'시간': {pos:'noun', root:'시간', meaning:'Thời gian, giờ giấc, tiếng đồng hồ', note:'Danh từ thời gian'},
	'책': {pos:'noun', root:'책', meaning:'Quyển sách, tập sách', note:'Danh từ học tập'},
	'영화': {pos:'noun', root:'영화', meaning:'Phim điện ảnh, bộ phim', note:'Danh từ giải trí'},
	'음악': {pos:'noun', root:'음악', meaning:'Âm nhạc, bài hát', note:'Danh từ nghệ thuật'},
	'노래': {pos:'noun', root:'노래', meaning:'Bài hát, ca khúc', note:'Danh từ âm nhạc'},
	'마음': {pos:'noun', root:'마음', meaning:'Trái tim, tấm lòng, tâm hồn', note:'Danh từ cảm xúc'},
	'사랑': {pos:'noun', root:'사랑', meaning:'Tình yêu, sự yêu thương', note:'Danh từ tình cảm'},
	'가족': {pos:'noun', root:'가족', meaning:'Gia đình', note:'Danh từ quan hệ'},
	'회사': {pos:'noun', root:'회사', meaning:'Công ty, nơi làm việc', note:'Danh từ nghề nghiệp'},
	'일': {pos:'noun', root:'일', meaning:'Công việc, sự việc, chuyện', note:'Danh từ'},
	'한': {pos:'num', root:'하나', meaning:'Một (từ hạn định số lượng thuần Hàn)', note:'Đi kèm danh từ đếm'},
	'잔': {pos:'noun', root:'잔', meaning:'Ly, chén, cốc (đơn vị đếm đồ uống)', note:'Lượng từ đếm'},
	'개': {pos:'noun', root:'개', meaning:'Cái, chiếc (đơn vị đếm đồ vật thông dụng)', note:'Lượng từ đếm'},
	'명': {pos:'noun', root:'명', meaning:'Người (đơn vị đếm người)', note:'Lượng từ đếm'},
	'권': {pos:'noun', root:'권', meaning:'Quyển, cuốn (đơn vị đếm sách)', note:'Lượng từ đếm'},
	'번': {pos:'noun', root:'번', meaning:'Lần, lượt (đơn vị đếm lần thực hiện)', note:'Lượng từ đếm'},
	'저': {pos:'pronoun', root:'저', meaning:'Tôi, em, cháu (đại từ xưng hô khiêm tốn)', note:'Đại từ ngôi thứ nhất'},
	'나': {pos:'pronoun', root:'나', meaning:'Tôi, tao, tớ (xưng hô thân mật)', note:'Đại từ thân mật'},
	'우리': {pos:'pronoun', root:'우리', meaning:'Chúng tôi, chúng ta, chúng mình', note:'Đại từ số nhiều'},
	'그': {pos:'pronoun', root:'그', meaning:'Đó, ấy, anh ấy, người đó', note:'Đại từ chỉ định'},
	'이': {pos:'pronoun', root:'이', meaning:'Này, đây, người này', note:'Đại từ chỉ định'},
	'네': {pos:'interj', root:'네', meaning:'Vâng, dạ, đúng vậy (lịch sự)', note:'Từ đáp lại'},
	'예': {pos:'interj', root:'예', meaning:'Vâng, dạ (trang trọng)', note:'Từ đáp lại'},
	'아니요': {pos:'interj', root:'아니요', meaning:'Không, không phải (lịch sự)', note:'Từ phủ định'},
	'그래서': {pos:'conj', root:'그래서', meaning:'Vì vậy, vì thế, cho nên', note:'Liên từ nối nguyên nhân kết quả'},
	'그리고': {pos:'conj', root:'그리고', meaning:'Và, thêm vào đó, sau đó', note:'Liên từ nối câu'},
	'하지만': {pos:'conj', root:'하지만', meaning:'Nhưng, tuy nhiên', note:'Liên từ tương phản'},
	'그런데': {pos:'conj', root:'그런데', meaning:'Thế nhưng, tiện thể, nhân tiện', note:'Liên từ chuyển hướng'},
	'그럼': {pos:'conj', root:'그럼', meaning:'Thế thì, vậy thì', note:'Liên từ điều kiện'},
	'좋다': {pos:'adj', root:'좋다', meaning:'Tốt, đẹp, hay, thích', note:'Tính từ mô tả'},
	'나쁘다': {pos:'adj', root:'나쁘다', meaning:'Xấu, tệ, không tốt', note:'Tính từ đối lập'},
	'따뜻하다': {pos:'adj', root:'따뜻하다', meaning:'Ấm áp, ấm cúng', note:'Tính từ nhiệt độ/cảm xúc'},
	'차갑다': {pos:'adj', root:'차갑다', meaning:'Lạnh, mát lạnh, lạnh lùng', note:'Tính từ nhiệt độ'},
	'시원하다': {pos:'adj', root:'시원하다', meaning:'Mát mẻ, sảng khoái', note:'Tính từ cảm giác'},
	'재미있다': {pos:'adj', root:'재미있다', meaning:'Thú vị, hay, vui nhộn', note:'Tính từ mô tả'},
	'재미없다': {pos:'adj', root:'재미없다', meaning:'Nhàm chán, không hay', note:'Tính từ đối lập'},
	'맛있다': {pos:'adj', root:'맛있다', meaning:'Ngon, ngon miệng', note:'Tính từ vị giác'},
	'맛없다': {pos:'adj', root:'맛없다', meaning:'Dở, không ngon', note:'Tính từ đối lập'},
	'예쁘다': {pos:'adj', root:'예쁘다', meaning:'Xinh đẹp, đẹp đẽ, dễ thương', note:'Tính từ ngoại hình'},
	'크다': {pos:'adj', root:'크다', meaning:'To, lớn, cao lớn', note:'Tính từ kích thước'},
	'작다': {pos:'adj', root:'작다', meaning:'Nhỏ, bé, thấp', note:'Tính từ kích thước'},
	'많다': {pos:'adj', root:'많다', meaning:'Nhiều', note:'Tính từ số lượng'},
	'적다': {pos:'adj', root:'적다', meaning:'Ít, ít ỏi', note:'Tính từ số lượng'},
	'어렵다': {pos:'adj', root:'어렵다', meaning:'Khó, khó khăn, phức tạp', note:'Tính từ'},
	'쉬워요': {pos:'adj', root:'쉽다', meaning:'Dễ dàng, không khó', note:'Tính từ'},
	'쉽다': {pos:'adj', root:'쉽다', meaning:'Dễ, đơn giản', note:'Tính từ'},
	'바쁘다': {pos:'adj', root:'바쁘다', meaning:'Bận rộn, tất bật', note:'Tính từ'},
	'맞다': {pos:'verb', root:'맞다', meaning:'Đúng, chính xác, phù hợp', note:'Động từ xác nhận'},
	'마시다': {pos:'verb', root:'마시다', meaning:'Uống (chất lỏng)', note:'Động từ hành động'},
	'먹다': {pos:'verb', root:'먹다', meaning:'Ăn (thức ăn, cơm)', note:'Động từ sinh hoạt'},
	'가다': {pos:'verb', root:'가다', meaning:'Đi, di chuyển tới nơi khác', note:'Động từ di chuyển'},
	'오다': {pos:'verb', root:'오다', meaning:'Đến, lại gần, xuất hiện', note:'Động từ di chuyển'},
	'보다': {pos:'verb', root:'보다', meaning:'Xem, nhìn, ngắm, xem xét', note:'Động từ tri giác'},
	'듣다': {pos:'verb', root:'듣다', meaning:'Nghe, lắng nghe', note:'Động từ thính giác'},
	'말하다': {pos:'verb', root:'말하다', meaning:'Nói, phát biểu, trò chuyện', note:'Động từ giao tiếp'},
	'이야기하다': {pos:'verb', root:'이야기하다', meaning:'Trò chuyện, kể chuyện, tâm sự', note:'Động từ giao tiếp'},
	'공부하다': {pos:'verb', root:'공부하다', meaning:'Học tập, nghiên cứu', note:'Động từ học vấn'},
	'배우다': {pos:'verb', root:'배우다', meaning:'Học, tiếp thu kiến thức', note:'Động từ'},
	'가르치다': {pos:'verb', root:'가르치다', meaning:'Dạy, giảng dạy, hướng dẫn', note:'Động từ giáo dục'},
	'연습하다': {pos:'verb', root:'연습하다', meaning:'Luyện tập, thực hành, rèn luyện', note:'Động từ rèn luyện'},
	'좋아하다': {pos:'verb', root:'좋아하다', meaning:'Thích, yêu thích', note:'Động từ tâm lý'},
	'싫어하다': {pos:'verb', root:'싫어하다', meaning:'Ghét, không thích', note:'Động từ tâm lý'},
	'사랑하다': {pos:'verb', root:'사랑하다', meaning:'Yêu, yêu thương', note:'Động từ tình cảm'},
	'사다': {pos:'verb', root:'사다', meaning:'Mua, mua sắm', note:'Động từ thương mại'},
	'주다': {pos:'verb', root:'주다', meaning:'Cho, tặng, trao gửi, làm giúp cho', note:'Động từ ban tặng'},
	'받다': {pos:'verb', root:'받다', meaning:'Nhận, tiếp nhận', note:'Động từ tiếp nhận'},
	'만나다': {pos:'verb', root:'만나다', meaning:'Gặp gỡ, hẹn gặp', note:'Động từ giao tiếp'},
	'헤어지다': {pos:'verb', root:'헤어지다', meaning:'Chia tay, chia xa, từ biệt', note:'Động từ đối lập'},
	'일하다': {pos:'verb', root:'일하다', meaning:'Làm việc, lao động', note:'Động từ công việc'},
	'쉬다': {pos:'verb', root:'쉬다', meaning:'Nghỉ ngơi, giải lao', note:'Động từ thư giãn'},
	'자다': {pos:'verb', root:'자다', meaning:'Ngủ, đi ngủ', note:'Động từ sinh hoạt'},
	'일어나다': {pos:'verb', root:'일어나다', meaning:'Thức dậy, đứng dậy, xảy ra', note:'Động từ'},
	'살다': {pos:'verb', root:'살다', meaning:'Sống, sinh sống, cư ngụ', note:'Động từ sinh sống'},
	'알다': {pos:'verb', root:'알다', meaning:'Biết, hiểu rõ, nhận thức', note:'Động từ nhận thức'},
	'모르다': {pos:'verb', root:'모르다', meaning:'Không biết, chưa rõ', note:'Động từ phủ định'},
	'생각하다': {pos:'verb', root:'생각하다', meaning:'Suy nghĩ, ngẫm nghĩ, tưởng rằng', note:'Động từ tư duy'},
	'기다리다': {pos:'verb', root:'기다리다', meaning:'Chờ đợi, đón đợi', note:'Động từ thời gian'},
	'있다': {pos:'adj', root:'있다', meaning:'Có, ở, tồn tại', note:'Từ tồn tại'},
	'없다': {pos:'adj', root:'없다', meaning:'Không có, vắng mặt', note:'Từ phủ định tồn tại'},
	'이다': {pos:'particle', root:'이다', meaning:'Là (trợ từ vị ngữ khẳng định)', note:'Trợ từ liên kết danh từ'},
	'아니다': {pos:'adj', root:'아니다', meaning:'Không phải là', note:'Từ phủ định danh từ'}
};

const PARTICLES = [
	{form:'에서는', pos:'particle', meaning:'Từ/Tại (nhấn mạnh nơi chốn)', type:'Trợ từ nơi chốn'},
	{form:'에서', pos:'particle', meaning:'Ở, tại, từ (nơi chốn xảy ra hành động hoặc xuất phát)', type:'Trợ từ nơi chốn'},
	{form:'에게서', pos:'particle', meaning:'Từ ai đó (nguồn nhận)', type:'Trợ từ nguồn'},
	{form:'한테서', pos:'particle', meaning:'Từ ai đó (văn nói)', type:'Trợ từ nguồn'},
	{form:'에게', pos:'particle', meaning:'Cho ai, với ai (kính ngữ/chuẩn)', type:'Trợ từ đối tượng'},
	{form:'한테', pos:'particle', meaning:'Cho ai, với ai (văn nói thân mật)', type:'Trợ từ đối tượng'},
	{form:'으로', pos:'particle', meaning:'Bằng, hướng về, bằng phương tiện', type:'Trợ từ phương tiện/phương hướng'},
	{form:'로', pos:'particle', meaning:'Bằng, hướng về, bằng phương tiện', type:'Trợ từ phương tiện/phương hướng'},
	{form:'부터', pos:'particle', meaning:'Từ (thời gian hoặc điểm khởi đầu)', type:'Trợ từ mốc bắt đầu'},
	{form:'까지', pos:'particle', meaning:'Đến, tới tận (mốc kết thúc)', type:'Trợ từ mốc kết thúc'},
	{form:'처럼', pos:'particle', meaning:'Như, giống như', type:'Trợ từ so sánh'},
	{form:'보다', pos:'particle', meaning:'Hơn (so với)', type:'Trợ từ so sánh'},
	{form:'이나', pos:'particle', meaning:'Hoặc, những, tận (nhấn mạnh số lượng)', type:'Trợ từ liên kết/nhấn mạnh'},
	{form:'나', pos:'particle', meaning:'Hoặc, những', type:'Trợ từ liên kết'},
	{form:'이랑', pos:'particle', meaning:'Và, cùng với (văn nói)', type:'Trợ từ liên kết'},
	{form:'랑', pos:'particle', meaning:'Và, cùng với (văn nói)', type:'Trợ từ liên kết'},
	{form:'과', pos:'particle', meaning:'Và, cùng với (sau từ có phụ âm cuối)', type:'Trợ từ liên kết'},
	{form:'와', pos:'particle', meaning:'Và, cùng với (sau từ không có phụ âm cuối)', type:'Trợ từ liên kết'},
	{form:'하고', pos:'particle', meaning:'Và, cùng với (thông dụng)', type:'Trợ từ liên kết'},
	{form:'은', pos:'particle', meaning:'Tiểu từ chủ đề (sau từ có phụ âm cuối)', type:'Tiểu từ chủ đề'},
	{form:'는', pos:'particle', meaning:'Tiểu từ chủ đề (sau từ không có phụ âm cuối)', type:'Tiểu từ chủ đề'},
	{form:'이', pos:'particle', meaning:'Tiểu từ chủ ngữ (sau từ có phụ âm cuối)', type:'Tiểu từ chủ ngữ'},
	{form:'가', pos:'particle', meaning:'Tiểu từ chủ ngữ (sau từ không có phụ âm cuối)', type:'Tiểu từ chủ ngữ'},
	{form:'을', pos:'particle', meaning:'Tiểu từ tân ngữ (sau từ có phụ âm cuối)', type:'Tiểu từ tân ngữ'},
	{form:'를', pos:'particle', meaning:'Tiểu từ tân ngữ (sau từ không có phụ âm cuối)', type:'Tiểu từ tân ngữ'},
	{form:'에', pos:'particle', meaning:'Ở, vào lúc, đến (thời gian hoặc địa điểm tồn tại/đích đến)', type:'Trợ từ thời gian/nơi chốn'},
	{form:'의', pos:'particle', meaning:'Của (chỉ sở hữu)', type:'Trợ từ sở hữu'},
	{form:'도', pos:'particle', meaning:'Cũng, cả', type:'Trợ từ bổ sung'},
	{form:'만', pos:'particle', meaning:'Chỉ (giới hạn duy nhất)', type:'Trợ từ giới hạn'}
];

const VERB_ENDINGS = [
	{pattern: /아\/어요|아요|어요|여요$/, strip: 2, rootEnding: '다', note:'Đuôi câu thân mật lịch sự (thì hiện tại)'},
	{pattern: /았어요|었어요|였어요|했어요$/, strip: 3, rootEnding: '다', note:'Đuôi câu quá khứ thân mật lịch sự'},
	{pattern: /습니다|ㅂ니다$/, strip: 3, rootEnding: '다', note:'Đuôi câu trang trọng lịch sự'},
	{pattern: /습니까|ㅂ니까$/, strip: 3, rootEnding: '다', note:'Đuôi câu nghi vấn trang trọng'},
	{pattern: /ㄹ게요|을게요|게요$/, strip: 3, rootEnding: '다', note:'Đuôi câu hứa hẹn/dự định (tôi sẽ...)'},
	{pattern: /ㄹ까요|을까요|까요$/, strip: 3, rootEnding: '다', note:'Đuôi câu rủ rê/hỏi ý kiến (nhé? chúng ta... nhé?)'},
	{pattern: /네요$/, strip: 2, rootEnding: '다', note:'Đuôi câu cảm thán ngạc nhiên (...thật đấy nhỉ)'},
	{pattern: /죠|지요$/, strip: 1, rootEnding: '다', note:'Đuôi câu xác nhận (...phải không nào)'},
	{pattern: /아서|어서|여서|해서$/, strip: 2, rootEnding: '다', note:'Liên từ phụ thuộc vì... nên / rồi thì'},
	{pattern: /으면|면$/, strip: 2, rootEnding: '다', note:'Đuôi câu điều kiện giả định (nếu... thì)'},
	{pattern: /고 싶어요|고 싶다$/, strip: 5, rootEnding: '다', note:'Mẫu câu mong muốn (muốn làm gì)'},
	{pattern: /고$/, strip: 1, rootEnding: '다', note:'Liên kết hành động (và, rồi)'},
	{pattern: /는데|은데|ㄴ데$/, strip: 2, rootEnding: '다', note:'Đuôi câu bối cảnh hoặc tương phản (nhưng mà, khi mà)'},
	{pattern: /러|으러$/, strip: 2, rootEnding: '다', note:'Chỉ mục đích đi lại (đi để làm gì)'},
	{pattern: /아\/어 주다|아 줘요|어 줘요|아 줄게요|어 줄게요|해 줄게요$/, strip: 4, rootEnding: '다', note:'Làm giúp / tặng cho ai điều gì'}
];

function lemmatizeVerbOrAdj(word){
	if(KOREAN_DICT[word]){
		const d = KOREAN_DICT[word];
		return {
			found: true,
			root: d.root,
			pos: d.pos,
			meaning: d.meaning,
			grammarNote: d.note || ''
		};
	}
	if(word.endsWith('해요')){
		const base = word.slice(0, -2);
		const root = base + '하다';
		const d = KOREAN_DICT[root];
		return {
			found: true,
			root: root,
			pos: d ? d.pos : 'verb',
			meaning: d ? d.meaning : `Làm ${base} (hiện tại lịch sự)`,
			grammarNote: 'Đuôi câu ~해요 hiện tại thân mật lịch sự'
		};
	}
	if(word.endsWith('했어요')){
		const base = word.slice(0, -3);
		const root = base + '하다';
		const d = KOREAN_DICT[root];
		return {
			found: true,
			root: root,
			pos: d ? d.pos : 'verb',
			meaning: d ? d.meaning + ' (đã làm trong quá khứ)' : `Đã làm ${base}`,
			grammarNote: 'Thì quá khứ ~했어요'
		};
	}
	if(word.endsWith('하고 싶어요')){
		const base = word.replace('하고 싶어요', '');
		const root = base + '하다';
		const d = KOREAN_DICT[root];
		return {
			found: true,
			root: root + ' / 싶다',
			pos: 'verb',
			meaning: `Muốn ${d ? d.meaning : base}`,
			grammarNote: 'Cấu trúc ~고 싶다 (muốn thực hiện hành động)'
		};
	}
	if(word.endsWith('고 싶어요')){
		const stem = word.replace('고 싶어요', '');
		const root = stem + '다';
		const d = KOREAN_DICT[root];
		return {
			found: true,
			root: root + ' / 싶다',
			pos: 'verb',
			meaning: `Muốn ${d ? d.meaning : stem}`,
			grammarNote: 'Cấu trúc ~고 싶다 (muốn làm gì)'
		};
	}
	if(word === '좋네요'){
		return {
			found: true,
			root: '좋다',
			pos: 'adj',
			meaning: 'Tốt, đẹp, hay, thích (cảm thán)',
			grammarNote: 'Đuôi câu cảm thán ngạc nhiên ~네요'
		};
	}
	if(word === '좋아요'){
		return {
			found: true,
			root: '좋다',
			pos: 'adj',
			meaning: 'Tốt, đẹp, hay, thích',
			grammarNote: 'Đuôi câu hiện tại ~아요'
		};
	}
	if(word === '좋은'){
		return {
			found: true,
			root: '좋다',
			pos: 'adj',
			meaning: 'Tốt, đẹp, hay (định từ bổ nghĩa cho danh từ theo sau)',
			grammarNote: 'Định từ tính từ ~은/ㄴ'
		};
	}
	if(word === '따뜻한'){
		return {
			found: true,
			root: '따뜻하다',
			pos: 'adj',
			meaning: 'Ấm áp, ấm cúng (định từ bổ nghĩa cho danh từ theo sau)',
			grammarNote: 'Định từ tính từ đuôi 하다 -> 한'
		};
	}
	if(word === '맛있는'){
		return {
			found: true,
			root: '맛있다',
			pos: 'adj',
			meaning: 'Ngon, ngon miệng (định từ bổ nghĩa cho danh từ theo sau)',
			grammarNote: 'Định từ tính từ ~는 đi sau 있다'
		};
	}
	if(word === '재미있게'){
		return {
			found: true,
			root: '재미있다',
			pos: 'adverb',
			meaning: 'Một cách thú vị, vui vẻ, thích thú',
			grammarNote: 'Biến tính từ thành phó từ với đuôi ~게'
		};
	}
	if(word === '맞아요'){
		return {
			found: true,
			root: '맞다',
			pos: 'verb',
			meaning: 'Đúng, đúng vậy, chính xác',
			grammarNote: 'Đuôi câu hiện tại ~아요'
		};
	}
	if(word === '마실까요'){
		return {
			found: true,
			root: '마시다',
			pos: 'verb',
			meaning: 'Uống (chúng mình... uống nhé?)',
			grammarNote: 'Đuôi rủ rê/đề nghị thân mật ~ㄹ/을까요'
		};
	}
	if(word === '사 줄게요' || word === '줄게요'){
		return {
			found: true,
			root: '사다 / 주다',
			pos: 'verb',
			meaning: 'Mua cho / sẽ làm cho',
			grammarNote: 'Cấu trúc ~아/어 주다 (làm giúp ai) kết hợp đuôi hứa hẹn ~ㄹ게요'
		};
	}
	if(word === '먹었어요'){
		return {
			found: true,
			root: '먹다',
			pos: 'verb',
			meaning: 'Đã ăn (thì quá khứ)',
			grammarNote: 'Đuôi câu quá khứ ~었어요'
		};
	}
	if(word.endsWith('이에요') || word.endsWith('예요')){
		const isYe = word.endsWith('예요');
		const nounPart = isYe ? word.slice(0, -2) : word.slice(0, -3);
		const dNoun = KOREAN_DICT[nounPart];
		return {
			found: true,
			root: (dNoun ? dNoun.root : nounPart) + ' + 이다',
			pos: 'noun',
			compound: true,
			nounPart: nounPart,
			endingPart: isYe ? '예요' : '이에요',
			meaning: dNoun ? `Là ${dNoun.meaning}` : `Là ${nounPart}`,
			grammarNote: 'Danh từ kết hợp trợ từ vị ngữ ~이에요/예요 (là...)'
		};
	}
	for(let i=0;i<VERB_ENDINGS.length;++i){
		const rule = VERB_ENDINGS[i];
		if(rule.pattern.test(word)){
			const clean = word.replace(rule.pattern, '');
			const candidates = [clean + '다', clean + '하다', clean + '이다'];
			for(let j=0;j<candidates.length;++j){
				const c = candidates[j];
				if(KOREAN_DICT[c]){
					return {
						found: true,
						root: c,
						pos: KOREAN_DICT[c].pos,
						meaning: KOREAN_DICT[c].meaning,
						grammarNote: rule.note
					};
				}
			}
		}
	}
	return {found: false};
}

function analyzeToken(rawToken){
	let puncBefore = '';
	let puncAfter = '';
	let clean = rawToken;

	const mBefore = clean.match(/^[^\p{L}\p{N}]+/u);
	if(mBefore){
		puncBefore = mBefore[0];
		clean = clean.slice(puncBefore.length);
	}
	const mAfter = clean.match(/[^\p{L}\p{N}]+$/u);
	if(mAfter){
		puncAfter = mAfter[0];
		clean = clean.slice(0, clean.length - puncAfter.length);
	}
	if(!clean){
		return {
			raw: rawToken,
			clean: '',
			puncBefore,
			puncAfter,
			pos: 'other',
			root: rawToken,
			meaning: rawToken,
			pronunciation: '',
			romaja: '',
			grammarNote: 'Ký tự hoặc dấu câu'
		};
	}
	const pronunciation = getPhoneticPronunciation(clean);
	const romaja = getRomaja(clean);

	if(KOREAN_DICT[clean]){
		const d = KOREAN_DICT[clean];
		return {
			raw: rawToken,
			clean,
			puncBefore,
			puncAfter,
			pos: d.pos,
			root: d.root,
			meaning: d.meaning,
			pronunciation,
			romaja,
			grammarNote: d.note || ''
		};
	}

	const vRes = lemmatizeVerbOrAdj(clean);
	if(vRes.found){
		return {
			raw: rawToken,
			clean,
			puncBefore,
			puncAfter,
			pos: vRes.pos,
			root: vRes.root,
			meaning: vRes.meaning,
			pronunciation,
			romaja,
			grammarNote: vRes.grammarNote
		};
	}

	for(let i=0;i<PARTICLES.length;++i){
		const p = PARTICLES[i];
		if(clean.length > p.form.length && clean.endsWith(p.form)){
			const stem = clean.slice(0, -p.form.length);
			if(KOREAN_DICT[stem]){
				const d = KOREAN_DICT[stem];
				return {
					raw: rawToken,
					clean,
					puncBefore,
					puncAfter,
					pos: d.pos,
					hasParticle: true,
					particle: p.form,
					particleType: p.type,
					particleMeaning: p.meaning,
					root: d.root,
					meaning: `${d.meaning} + [${p.form}: ${p.meaning}]`,
					pronunciation,
					romaja,
					grammarNote: `Gốc [${d.root}] (${d.pos === 'noun' ? 'Danh từ' : d.pos}) kết hợp ${p.type} '${p.form}'`
				};
			}
			const stemVRes = lemmatizeVerbOrAdj(stem);
			if(stemVRes.found){
				return {
					raw: rawToken,
					clean,
					puncBefore,
					puncAfter,
					pos: stemVRes.pos,
					hasParticle: true,
					particle: p.form,
					root: stemVRes.root,
					meaning: `${stemVRes.meaning} + [${p.form}]`,
					pronunciation,
					romaja,
					grammarNote: `Động/tính từ [${stemVRes.root}] + Trợ từ '${p.form}'`
				};
			}
			return {
				raw: rawToken,
				clean,
				puncBefore,
				puncAfter,
				pos: 'noun',
				hasParticle: true,
				particle: p.form,
				root: stem,
				meaning: `Từ [${stem}] + [Trợ từ ${p.form}: ${p.meaning}]`,
				pronunciation,
				romaja,
				grammarNote: `Phân tích: Danh từ '${stem}' + ${p.type} '${p.form}'`
			};
		}
	}

	return {
		raw: rawToken,
		clean,
		puncBefore,
		puncAfter,
		pos: 'noun',
		root: clean,
		meaning: `Từ vựng [${clean}]`,
		pronunciation,
		romaja,
		grammarNote: 'Từ vựng tiếng Hàn'
	};
}

function analyzeKoreanSentence(sentence){
	const trimmed = sentence.trim();
	if(!trimmed) return [];
	const rawWords = trimmed.split(/\s+/);
	const tokens = [];
	for(let i=0;i<rawWords.length;++i){
		tokens.push(analyzeToken(rawWords[i]));
	}
	return tokens;
}

const POS_CONFIG = {
	noun: {
		label: 'Danh từ',
		color: '#10B981',
		underlineClass: 'border-b-4 border-emerald-500 hover:bg-emerald-50 text-emerald-900',
		badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
		borderClass: 'border-emerald-500',
		description: 'Từ chỉ người, sự vật, thời gian hoặc địa điểm'
	},
	verb: {
		label: 'Động từ',
		color: '#EF4444',
		underlineClass: 'border-b-4 border-rose-500 hover:bg-rose-50 text-rose-900',
		badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
		borderClass: 'border-rose-500',
		description: 'Từ chỉ hành động, hoạt động hoặc trạng thái biến đổi'
	},
	adj: {
		label: 'Tính từ',
		color: '#3B82F6',
		underlineClass: 'border-b-4 border-blue-500 hover:bg-blue-50 text-blue-900',
		badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
		borderClass: 'border-blue-500',
		description: 'Từ chỉ tính chất, đặc điểm hoặc trạng thái'
	},
	particle: {
		label: 'Tiểu từ / Trợ từ',
		color: '#8B5CF6',
		underlineClass: 'border-b-4 border-purple-500 hover:bg-purple-50 text-purple-900',
		badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
		borderClass: 'border-purple-500',
		description: 'Gắn sau danh từ để xác định chức năng ngữ pháp'
	},
	adverb: {
		label: 'Phó từ',
		color: '#F59E0B',
		underlineClass: 'border-b-4 border-amber-500 hover:bg-amber-50 text-amber-900',
		badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
		borderClass: 'border-amber-500',
		description: 'Bổ nghĩa cho động từ, tính từ hoặc toàn câu'
	},
	pronoun: {
		label: 'Đại từ',
		color: '#14B8A6',
		underlineClass: 'border-b-4 border-teal-500 hover:bg-teal-50 text-teal-900',
		badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
		borderClass: 'border-teal-500',
		description: 'Đại từ nhân xưng hoặc chỉ định thay thế'
	},
	conj: {
		label: 'Liên từ',
		color: '#6366F1',
		underlineClass: 'border-b-4 border-indigo-500 hover:bg-indigo-50 text-indigo-900',
		badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
		borderClass: 'border-indigo-500',
		description: 'Từ nối các vế câu hoặc nối các câu văn'
	},
	num: {
		label: 'Số từ / Lượng từ',
		color: '#06B6D4',
		underlineClass: 'border-b-4 border-cyan-500 hover:bg-cyan-50 text-cyan-900',
		badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
		borderClass: 'border-cyan-500',
		description: 'Từ chỉ số lượng hoặc thứ tự'
	},
	interj: {
		label: 'Thán từ',
		color: '#EC4899',
		underlineClass: 'border-b-4 border-pink-500 hover:bg-pink-50 text-pink-900',
		badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
		borderClass: 'border-pink-500',
		description: 'Từ chào hỏi, thốt lên bộc lộ cảm xúc'
	},
	other: {
		label: 'Khác',
		color: '#64748B',
		underlineClass: 'border-b-4 border-slate-400 hover:bg-slate-50 text-slate-900',
		badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
		borderClass: 'border-slate-400',
		description: 'Từ loại khác hoặc dấu câu'
	}
};

window.HanGakNLP = {
	decomposeHangul,
	composeHangul,
	getPhoneticPronunciation,
	getRomaja,
	analyzeToken,
	analyzeKoreanSentence,
	POS_CONFIG,
	KOREAN_DICT,
	PARTICLES
};
