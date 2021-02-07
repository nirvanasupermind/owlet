/**
 * AST Transformer.
 */
class Transformer {
    /**
     * Transforms `def`-expression into a varlambda.
     * @param {*} defExp 
     */
    transformDefToVarLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        return ['local', name, ['lambda', params, body]]
    }

    /**
     * Transforms `switch` to nested `if`-expressions.
     * @param {*} switchExp 
     */
    transformSwitchToIf(switchExp) {
        const [_tag, ...cases] = switchExp;
        const ifExp = ['if', null, null, null];

        let current = ifExp;
        for (let i = 0; i < cases.length - 1; i++) {
            const [currentCond, currentBlock] = cases[i];

            current[1] = currentCond;
            current[2] = currentBlock;

            const next = cases[i + 1];
            const [nextCond, nextBlock] = next;


            current[3] = (nextCond === 'else' ? nextBlock : ['if']);

            current = current[3];
        }

        return ifExp;
    }

    transformForToWhile(exp) {
        return ["begin",
            exp[1],
            ["while", exp[2], ["begin",
                exp[4],
                exp[3]
            ]
            ]];
    }

    transformPlusEquals(exp) {
        return ["set", exp[1], ["+", exp[1], exp[2]]];
    }

    transformMinusEquals(exp) {
        return ["set", exp[1], ["-", exp[1], exp[2]]];
    }


}

module.exports = Transformer;