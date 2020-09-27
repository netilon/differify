
type modeOptions = {
  array?: string;
  object?: string;
  function?: string;
};

type config = {
  mode ?: modeOptions 
  compareArraysInOrder?: boolean;
};

export default config;
