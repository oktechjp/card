export type Codec<In, Out> = {
  encode(input: In): Out;
  decode(output: Out): In;
};
