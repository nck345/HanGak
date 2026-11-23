const SAMPLE_SENTENCES = [
	{
		title: 'Chào hỏi & Thời tiết',
		text: '안녕하세요! 오늘 날씨가 정말 좋네요.',
		translation: 'Xin chào! Thời tiết hôm nay thật đẹp nhỉ.'
	},
	{
		title: 'Học tập hàng ngày',
		text: '저는 매일 한국어를 재미있게 공부해요.',
		translation: 'Tôi học tiếng Hàn một cách rất thú vị mỗi ngày.'
	},
	{
		title: 'Dạo chơi công viên',
		text: '오늘 날씨가 정말 좋아서 공원에 가고 싶어요.',
		translation: 'Hôm nay thời tiết thật đẹp nên tôi muốn đi công viên.'
	},
	{
		title: 'Ăn uống cùng bạn bè',
		text: '어제 친구와 맛있는 음식을 많이 먹었어요.',
		translation: 'Hôm qua tôi đã ăn rất nhiều món ăn ngon cùng với bạn.'
	},
	{
		title: 'Rủ rê đi cà phê',
		text: '우리 따뜻한 커피 한 잔 마실까요?',
		translation: 'Chúng mình cùng uống một ly cà phê ấm nhé?'
	},
	{
		title: 'Luyện tập qua phim ảnh',
		text: '한국 드라마를 보면서 한국어 말하기를 연습해요.',
		translation: 'Tôi vừa xem phim truyền hình Hàn Quốc vừa luyện tập nói tiếng Hàn.'
	}
];

const SAMPLE_VIDEO_DATA = {
	videoSrc: 'media/sample.mp4',
	title: 'Cuộc trò chuyện tại quán cà phê (Episode 1)',
	segments: [
		{
			id: 1,
			startTime: 0.0,
			endTime: 3.5,
			speaker: 'Minji',
			koreanText: '안녕하세요! 오늘 날씨가 정말 좋네요.',
			vietnameseMeaning: 'Xin chào! Thời tiết hôm nay thật đẹp nhỉ.'
		},
		{
			id: 2,
			startTime: 3.5,
			endTime: 7.0,
			speaker: 'Junho',
			koreanText: '네, 맞아요. 그래서 기분이 아주 좋아요.',
			vietnameseMeaning: 'Vâng, đúng vậy. Vì thế tâm trạng tôi rất tốt.'
		},
		{
			id: 3,
			startTime: 7.0,
			endTime: 10.5,
			speaker: 'Minji',
			koreanText: '우리 따뜻한 커피 한 잔 마실까요?',
			vietnameseMeaning: 'Chúng mình uống một ly cà phê ấm nhé?'
		},
		{
			id: 4,
			startTime: 10.5,
			endTime: 14.0,
			speaker: 'Junho',
			koreanText: '좋은 생각이에요! 저는 아메리카노를 좋아해요.',
			vietnameseMeaning: 'Ý kiến hay đấy! Tôi thích cà phê Americano.'
		},
		{
			id: 5,
			startTime: 14.0,
			endTime: 18.0,
			speaker: 'Minji',
			koreanText: '그럼 제가 맛있는 커피를 사 줄게요.',
			vietnameseMeaning: 'Vậy thì tôi sẽ mua cà phê ngon cho bạn nhé.'
		}
	]
};

window.HanGakData = {
	SAMPLE_SENTENCES,
	SAMPLE_VIDEO_DATA
};
