import { j$ } from '../tools/jstat.es6';

/*
 * Bayesian A/B Testing
 * ---
 * @param {number} alphaA - The number of successes for A
 * @param {number} betaA - The number of failures for A
 * @param {number} alphaB - The number of successes for B
 * @param {number} betaB - The number of failures for B
 */
export function bayesianTest(alphaA, betaA, alphaB, betaB) {
  alphaA += 1;
  betaA += 1;
  alphaB += 1;
  betaB += 1;

  var test = 0,
    i;
  for (i = 0; i < (alphaB - 1); i += 1) {
    test += Math.exp(j$.betaln(alphaA + i, betaB + betaA)
                     - Math.log(betaB + i)
                     - j$.betaln(1 + i, betaB)
                     - j$.betaln(alphaA, betaA));
  }

  // Returns the probability that B is better than A
  return test;
}

/*
 * Bayesian Decision Rules
 * ---
 * @param {number} alphaA - The number of successes for A
 * @param {number} betaA - The number of failures for A
 * @param {number} alphaB - The number of successes for B
 * @param {number} betaB - The number of failures for B
 */
export function bayesianDecision(alphaA, betaA, alphaB, betaB) {

  let h1 = 1 - bayesianTest((alphaA + 1), betaA, alphaB, betaB),
    h2 = 1 - bayesianTest(alphaA, betaA, (alphaB + 1), betaB),
    b1 = Math.exp(j$.betaln((alphaA + 1), betaA) - j$.betaln(alphaA, betaA)),
    b2 = Math.exp(j$.betaln((alphaB + 1), betaB) - j$.betaln(alphaB, betaB));

  return (b1 * h1) - (b2 * h2);
}