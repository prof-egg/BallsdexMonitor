/******************************************************************************
 *  An elementary random static library containing methods to generate
 *  psuedo-random numbers that also contains a method for shuffling 
 *  an array. This library was inspired by Robert Sedgewick's Kevin Wayne's
 *  Algs4 StdRandom Java library: 
 *  https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/StdRandom.html.
 *  
 *  Ditribution wishlist:
 *   - bernoulli
 *   - gaussian
 *   - discrete
 *   - exponential
 * 
 *  Remark:
 *   - Relies on randomness of Math.random() method in
 *     to generate pseudo-random numbers in [0, 1).
 *
 ******************************************************************************/

/**
 *  **Overview**.
 *  The `Random` class provides static methods for generating
 *  random numbers. It also provides a method for shuffling an
 *  array or subarrays.
 *
 *  **Conventions.**
 *  By convention, all intervals are half open. For example,
 *  `uniformInt(-1.0, 1.0)` returns a random number between
 *  `-1.0` (inclusive) and `1.0` (exclusive).
 *  Similarly, `shuffle(array, lo, hi)` shuffles the `hi - lo`
 *  elements in the array `array[]`, starting at index `lo`
 *  (inclusive) and ending at index `hi` (exclusive).
 *
 *  **Performance.**
 *  All methods take constant expected time, except for the 
 *  `shuffle` method, which takes linear time.
 */
export class Random {

    /**
     * Has a 1 in `odds` chance to return true
     * @param {number} odds the odds of this method returning `true`
     * @returns `true` in a 1 in `odds` chance
     * @throws TypeError if `(odds < 1)`
     */
    static weightedCoinFlip(odds: number): boolean {
        if (odds < 1) throw new TypeError("Odds must be at least 1.")
        if (this.randInt(1, odds) == 1) return true
        return false
    } 

    /**
     * Returns a random integer in [0, `n`)
     * @param {number} n exclusive end value
     * @returns a random integer in [0, `n`)
     * @throws TypeError if `(n <= 0)`
     */
    static uniformInt(n: number): number {
        if (n <= 0) throw new TypeError("n must be a positive integer")
        return Math.floor(Math.random() * n);
    }

    /**
     * Returns a random integer in [`a`, `b`)
     * @param {number} a inclusive start value
     * @param {number} b exclusive end value
     * @returns a random integer in [`a`, `b`)
     * @throws TypeError if `(a >= b)`
     */
    static randInt(a: number, b: number): number {
        // `invalid range: [${a}, ${b})`
        if (a >= b) throw new TypeError("b must be bigger than a")
        return a + this.uniformInt(b - a);
    }

    /**
     * Rearranges the given array provided 
     * the array using knuth's shuffle
     * @param {Array<(number | string | boolean | object)>} array 
     * @param {number} low the low end of the range you're shuffling
     * @param {number} high the high end of the range you're shuffling
     * @throws TypeError if array is null or undefined
     * @throws TypeError if `(low < 0 || high > array.length || low > high)`
     */
    static shuffle(array: Array<(number | string | boolean | object)>, low?: number, high?: number): void {
        this.validateNotNull(array);
    
        low = (low === undefined) ? 0 : low
        high = (high === undefined) ? array.length : high

        this.validateSubarrayIndices(low, high, array.length)

        for (let i = 0; i < array.length; i++) {
            const r = this.uniformInt(i + 1);
            const temp = array[i];
            array[i] = array[r];
            array[r] = temp;
        }
    }

    /***************************************************************************
    * Validators
    ***************************************************************************/

    // Validate not null
    private static validateNotNull(x: object) {
        if (x === null || x === undefined) 
            throw new TypeError("Argument must not be undefined")
        
    }

    // throw an exception unless 0 <= lo <= hi <= length
    private static validateSubarrayIndices(lo: number, hi: number, length: number) {
        if (lo < 0 || hi > length || lo > hi) 
            throw new TypeError("Subarray indices out of bounds: [" + lo + ", " + hi + ")");
        
    }
}