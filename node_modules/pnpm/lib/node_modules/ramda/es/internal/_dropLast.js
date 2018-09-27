import take from '../take';

export default function dropLast(n, xs) {
  return take(n < xs.length ? xs.length - n : 0, xs);
}