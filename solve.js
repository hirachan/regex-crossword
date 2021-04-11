const N = 200
const G = 50000
const mutation_rate = 0.3;
const two_point_crossover_rate = 0.3;
const uniform_crossover_rate = 0.3;
const copy_rate = 1.0 - mutation_rate - two_point_crossover_rate - uniform_crossover_rate;
const wait = 0.0


function draw(data) {
    var rows = data.rows
    var i, j, id, val;
    for (i = 0; i < size; i += 1) {
        for (j = 0; j < rowSize(i); j += 1) {
            id = '#cell_' + i + '_' + j
            val = (rows[i] && rows[i][j] || '')
            if (val === '?') {
                val = ''
            }
          $(id).val(val)
        }
    }
}


function getRandomChar() {
    return String.fromCharCode('A'.charCodeAt(0) + Math.random() * 26)
}


function getRandomData() {
    var i, j
    var data = { rows: [] }
    for (i = 0; i < size; ++i) {
        var row = []
        for (j = 0; j < rowSize(i); ++j) {
            row[j] = getRandomChar()
        }
        data.rows[i] = row
    }

    return data
}

function deep_copy(o) {
    return JSON.parse(JSON.stringify(o))
}


function swap(data1, data2, i, j) {
    tmp = data1.rows[i][j]
    data1.rows[i][j] = data2.rows[i][j]
    data2.rows[i][j] = tmp
}


function getNextData(roulette) {
    var ret = []
    var rand = Math.random()
    var new_data, new_data2

    if (rand < copy_rate) {
        new_data = deep_copy(roulette[Math.floor(Math.random() * roulette.length)])
        // do nothing
        ret.push(new_data)
    } else if (rand - copy_rate < mutation_rate) {
        new_data = deep_copy(roulette[Math.floor(Math.random() * roulette.length)])
        var swap_num = Math.floor(Math.random() * size)
        for (i = 1; i <= swap_num; i++) {
            i1 = Math.floor(Math.random() * size)
            j1 = Math.floor(Math.random() * rowSize(i1))
            new_data.rows[i1][j1] = getRandomChar()
        }
        ret.push(new_data)
    } else {
        tmp = roulette[Math.floor(Math.random() * roulette.length)]
        new_data = deep_copy(tmp)
        do {
            tmp2 = roulette[Math.floor(Math.random() * roulette.length)]
        } while (tmp2 == tmp)
        new_data2 = deep_copy(tmp2)

        if (rand - copy_rate - mutation_rate < uniform_crossover_rate) {
            for (i = 0; i < size; i++) {
                for (j = 0; j < rowSize(i); j++) {
                    if (Math.random() < 0.5) {
                        swap(new_data, new_data2, i, j)
                    }
                }
            }
        } else {
            i1 = Math.floor(Math.random() * size)
            j1 = Math.floor(Math.random() * rowSize(i1))
            i2 = Math.floor(Math.random() * size)
            j2 = Math.floor(Math.random() * rowSize(i2))

            if (i1 == i2) {
                if (j1 <= j2) {
                    for (j = j1; j <= j2; j++) {
                        swap(new_data, new_data2, i1, j)
                    }
                } else {
                    for (j = j1; j < rowSize(i1); j++) {
                        swap(new_data, new_data2, i1, j)
                    }
                    for (i = i1 + 1; i < size; i++) {
                        for (j = 0; j < rowSize(i); j++) {
                            swap(new_data, new_data2, i, j)
                        }
                    }
                    for (j = j2; j >= 0; j--) {
                        swap(new_data, new_data2, i1, j)
                    }
                    for (i = i1 - 1; i >= 0; i--) {
                        for (j = 0; j < rowSize(i); j++) {
                            swap(new_data, new_data2, i, j)
                        }
                    }
                }
            } if (i1 <= i2) {
                for (j = j1; j < rowSize(i1); j++) {
                    swap(new_data, new_data2, i1, j)
                }
                for (i = i1 + 1; i < i2; i++) {
                    for (j = 0; j < rowSize(i); j++) {
                        swap(new_data, new_data2, i, j)
                    }
                }
                for (j = j2; j >= 0; j--) {
                    swap(new_data, new_data2, i2, j)
                }
            } else {
                for (j = j1; j < rowSize(i1); j++) {
                    swap(new_data, new_data2, i1, j)
                }
                for (i = i1 + 1; i < size; i++) {
                    for (j = 0; j < rowSize(i); j++) {
                        swap(new_data, new_data2, i, j)
                    }
                }
                for (j = j2; j >= 0; j--) {
                    swap(new_data, new_data2, i2, j)
                }
                for (i = i2 - 1; i >= 0; i--) {
                    for (j = 0; j < rowSize(i); j++) {
                        swap(new_data, new_data2, i, j)
                    }
                }
            }
        }
        ret.push(new_data)
        ret.push(new_data2)
    }
    return ret
}


function getNextGen(user_datas) {
    var best_data
    var best_match = 0
    var next_user_datas = []

    // Make a roulette (The more match has the more win)
    var roulette = []
    user_datas.forEach(arg => {
        for (var i = 1; i <= arg.match; i++) {
            roulette.push(arg.user_data)
        }
    })

    for (var n = 0; n < N;) {
        for (var new_data of getNextData(roulette)) {
            match = checkRules(new_data, false)
            next_user_datas.push({ user_data: new_data, match: match })
            n += 1
            if (n >= N) break
        }
    }

    return next_user_datas
}


function getBestData(user_datas) {
    var best_data
    var best_match = 0
    for (var data of user_datas) {
        if (data.match > best_match) {
            best_match = data.match
            best_data = data.user_data
        }
    }
    return { user_data: best_data, match: best_match }
}


var g = 0
var finish
function solveMain(user_datas) {
    best = getBestData(user_datas)

    if (g % 10 == 0) {
        $("#gen").text(g)
        draw(best.user_data)
        checkRules(best.user_data, true)
    }

    if (best.match == size * 3) {
        console.log("solved!")
        finish = true
    }

    if (g < G && !finish) {
        g += 1
        next_user_datas = getNextGen(user_datas)
        window.setTimeout(() => solveMain(next_user_datas), wait * 1000);
    } else {
        console.log(g)
        $("#gen").val(g)
    }
}


function solve() {
    var user_datas = []
    finish = false
    for (var i = 0; i < N; i++) {
        data = getRandomData()
        user_datas.push({ user_data: data, match: checkRules(data, false) })
    }

    solveMain(user_datas)
}


function init2() {
  $('#solve_button').click(solve);
}


$(init2)
