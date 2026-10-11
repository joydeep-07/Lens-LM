const chats = [
  {
    id: 1,
    title: "Understanding Photosynthesis",
    category: "Today",
    date: "2 hours ago",
    pinned: true,
    tags: ["Science", "Biology"],
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "What is photosynthesis?",
        time: "09:30 AM",
      },
      {
        id: "msg-2",
        role: "assistant",
        content:
          "Photosynthesis is the process used by plants, algae, and some bacteria to convert sunlight into chemical energy. They use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
        time: "09:30 AM",
      },
      {
        id: "msg-3",
        role: "user",
        content: "Why do plants look green?",
        time: "09:31 AM",
      },
      {
        id: "msg-4",
        role: "assistant",
        content:
          "Plants look green because of a pigment called chlorophyll. Chlorophyll absorbs blue and red light from the sunlight spectrum while reflecting green light.",
        time: "09:31 AM",
      },
    ],
  },
  {
    id: 2,
    title: "The Industrial Revolution",
    category: "Today",
    date: "4 hours ago",
    pinned: false,
    tags: ["History", "Economy"],
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "When and where did the Industrial Revolution begin?",
        time: "04:45 PM",
      },
      {
        id: "msg-6",
        role: "assistant",
        content:
          "The Industrial Revolution began in Great Britain during the mid-18th century, roughly around the 1760s, before spreading to the rest of Europe and North America.",
        time: "04:45 PM",
      },
      {
        id: "msg-7",
        role: "user",
        content: "What was the main invention that sparked it?",
        time: "04:46 PM",
      },
      {
        id: "msg-8",
        role: "assistant",
        content:
          "While many inventions contributed, the improvement of the steam engine by James Watt is widely considered one of the primary catalysts that powered factories, trains, and machinery.",
        time: "04:46 PM",
      },
    ],
  },
  {
    id: 3,
    title: "Solar System Mysteries",
    category: "Yesterday",
    date: "Yesterday",
    pinned: true,
    tags: ["Space", "Astronomy"],
    messages: [
      {
        id: "msg-9",
        role: "user",
        content: "Why is Venus the hottest planet in our solar system?",
        time: "11:20 AM",
      },
      {
        id: "msg-10",
        role: "assistant",
        content:
          "Even though Mercury is closer to the Sun, Venus is the hottest because of its thick atmosphere composed mostly of carbon dioxide, which creates a runaway greenhouse effect.",
        time: "11:20 AM",
      },
      {
        id: "msg-11",
        role: "user",
        content: "How hot does it get on Venus?",
        time: "11:21 AM",
      },
      {
        id: "msg-12",
        role: "assistant",
        content:
          "Surface temperatures on Venus can reach around 475 degrees Celsius, which is hot enough to melt lead.",
        time: "11:21 AM",
      },
    ],
  },
  {
    id: 4,
    title: "World Geography Facts",
    category: "Previous 7 Days",
    date: "3 days ago",
    pinned: false,
    tags: ["Geography", "Earth"],
    messages: [
      {
        id: "msg-13",
        role: "user",
        content: "What is the longest river in the world?",
        time: "02:10 PM",
      },
      {
        id: "msg-14",
        role: "assistant",
        content:
          "The Nile River is traditionally considered the longest river in the world, stretching approximately 6,650 kilometers through northeastern Africa.",
        time: "02:10 PM",
      },
      {
        id: "msg-15",
        role: "user",
        content: "Which river has the largest water volume?",
        time: "02:11 PM",
      },
      {
        id: "msg-16",
        role: "assistant",
        content:
          "The Amazon River holds the title for the largest river by water volume, containing more water than the next seven largest rivers combined.",
        time: "02:11 PM",
      },
    ],
  },
  {
    id: 5,
    title: "The Origins of Coffee",
    category: "Previous 7 Days",
    date: "5 days ago",
    pinned: false,
    tags: ["Culture", "History"],
    messages: [
      {
        id: "msg-17",
        role: "user",
        content: "Who discovered coffee?",
        time: "07:00 PM",
      },
      {
        id: "msg-18",
        role: "assistant",
        content:
          "According to legend, coffee was discovered in the 9th century by an Ethiopian goat herder named Kaldi, who noticed his goats became very energetic after eating berries from a certain tree.",
        time: "07:00 PM",
      },
      {
        id: "msg-19",
        role: "user",
        content: "Where did coffee drinking first become popular?",
        time: "07:01 PM",
      },
      {
        id: "msg-20",
        role: "assistant",
        content:
          "Coffee drinking first spread to the Arabian Peninsula, becoming widely popular in Yemen during the 15th century before spreading to the rest of the Middle East and Europe.",
        time: "07:01 PM",
      },
    ],
  },
];

export default chats;
