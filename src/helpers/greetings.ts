const profileGreetings = [
  "Selam sana dost",
  "Merhaba",
  "Selam moruk",
  "Naber",
  "Selam kanka",
  "Merhaba moruk",
  "Selamlar",
  "Naber dost",
  "Hoooooooop",
  "Hoşgeldin",
];

export const getRandomProfileGreeting = () => {
  return profileGreetings[Math.floor(Math.random() * profileGreetings.length)];
};
