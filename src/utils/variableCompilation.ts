import customFunctions from './customFunctions'

const customFunctionsKeys = Object.keys(customFunctions)
/**
 * 变量编译解析
 */
class TvariableCompilation {
  private static mInstance: TvariableCompilation
  private ignoreOperators: ('+' | '-' | '*' | '/' | '%')[] = []
  private validOperators: ('+' | '-' | '*' | '/' | '%')[] = ['+', '-', '*', '/', '%']
  private operatorRegex: RegExp = /([+\-*/%()]|__hanshufengefu__)/
  constructor() {
    this.setIgnoreOperators()
  }
  public setIgnoreOperators(operators: ('+' | '-' | '*' | '/' | '%')[] = []) {
    const allOperators: ('+' | '-' | '*' | '/' | '%')[] = ['+', '-', '*', '/', '%']
    this.ignoreOperators = [...operators]
    this.validOperators = allOperators.filter((op) => !this.ignoreOperators.includes(op))
    this.operatorRegex = this.shouldMatchItem(this.validOperators)
  }
  /**
   * 获取系统变量类单例
   * @returns
   */
  public static getInstance(): TvariableCompilation {
    if (!this.mInstance) {
      this.mInstance = new TvariableCompilation()
    }
    return this.mInstance
  }
  /**
   * =替换为===
   * @param str
   * @returns
   */
  public replaceEqualWithStrictEqual(str) {
    let result = ''
    let inQuotes = false
    let quoteChar = ''
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '"' || str[i] === "'") {
        if (!inQuotes) {
          inQuotes = true
          quoteChar = str[i]
        } else if (str[i] === quoteChar) {
          inQuotes = false
        }
        result += str[i]
        continue
      }
      if (
        !inQuotes &&
        str[i] === '=' &&
        str[i + 1] !== '=' &&
        str[i - 1] !== '=' &&
        str[i - 1] !== '>' &&
        str[i - 1] !== '<' &&
        str[i - 1] !== '!'
      ) {
        result += '==='
      } else {
        result += str[i]
      }
    }
    return result
  }

  // 转换中文标点符号为英文标点符号的函数
  public convertChinesePunctuationToEnglish(input: string | string[]) {
    const punctuationMap = {
      '【': '{',
      '】': '}',
      '《': '<',
      '》': '>',
      '，': ',',
      '；': ';',
      '＝': '=',
      '～': '~',
      '！': '!',
      '？': '?',
      '：': ':',
      '（': '(',
      '）': ')',
      '“': '"',
      '”': '"',
      '‘': "'",
      '’': "'",
      '…': '...',
      '—': '-',
      '《=': '<=',
      '》=': '>=',
      '≠': '!=',
      '≥': '>=',
      '≤': '<=',
      '≡': '===',
    }

    let output = ''
    let inQuotes = false
    let quoteType = ''
    const sortedKeys = Object.keys(punctuationMap).sort((a, b) => b.length - a.length)

    for (let i = 0; i < input.length; i++) {
      if ((input[i] === '"' || input[i] === "'") && (i === 0 || input[i - 1] !== '\\')) {
        if (inQuotes && input[i] === quoteType) {
          inQuotes = false
        } else if (!inQuotes) {
          inQuotes = true
          quoteType = input[i]
        }
      }

      if (!inQuotes) {
        let replaced = false
        for (const key of sortedKeys) {
          if (input.slice(i, i + key.length) === key) {
            output += punctuationMap[key]
            i += key.length - 1
            replaced = true
            break
          }
        }
        if (!replaced) {
          output += input[i]
        }
      } else {
        output += input[i]
      }
    }
    return this.replaceEqualWithStrictEqual(output)
  }
  /**
   *
   * @param str 切割字符为数组，主要是为了识别函数 目前只限于math函数
   * @returns
   */
  public splitFunctionString(str: string): string[] {
    const result = []
    let current = ''
    const stack = []
    const operators = this.validOperators

    for (let i = 0; i < str.length; i++) {
      const char = str[i]

      if (char === '(') {
        if (current) {
          // console.log('current', current)
          result.push(current)
          current = ''
        }
        result.push('(')
        stack.push('(')
      } else if (char === ')') {
        if (current) {
          result.push(current)
          current = ''
        }
        result.push(')')
        stack.pop()
      } else if (str.slice(i, i + '__hanshufengefu__'.length) === '__hanshufengefu__') {
        if (current) {
          result.push(current)
          current = ''
        }
        result.push('__hanshufengefu__')
        i += '__hanshufengefu__'.length - 1
      } else if (operators.includes(char as '+' | '-' | '*' | '/' | '%')) {
        if (current) {
          result.push(current)
          current = ''
        }
        result.push(char)
      } else {
        current += char
      }

      // 处理嵌套函数调用
      if (stack.length > 0 && current.match(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/) && str[i + 1] === '(') {
        current = ''
        stack.push('(')
        i++
        const subStr = this.extractNestedFunction(str, i)
        const nestedResult = this.splitFunctionString(subStr)
        result.push(...nestedResult)
        result.push(')')
        stack.pop()
        i += subStr.length
      }
    }

    if (current) {
      result.push(current)
    }

    return result
  }
  /**
   * 识别嵌套函数
   * @param str
   * @param startIndex
   * @returns
   */
  public extractNestedFunction(str: string, startIndex: number) {
    let parenCount = 1
    let endIndex = startIndex
    for (let i = startIndex + 1; i < str.length; i++) {
      if (str[i] === '(') {
        parenCount++
      } else if (str[i] === ')') {
        parenCount--
        if (parenCount === 0) {
          endIndex = i
          break
        }
      }
    }
    return str.slice(startIndex, endIndex)
  }

  /**
   *type:
   * 1:不转换
   * 2:Math的方法转换为Math.方法
   * 3:__hanshufengefu__替换回正常的,
   * @param str
   * @returns
   */
  public convertToMathMethods(str: string, type = 1) {
    // 获取 Math 对象的所有属性名
    const mathProperties = Object.getOwnPropertyNames(Math)

    // 过滤出 Math 对象中的方法
    const mathMethods = mathProperties.filter((prop) => {
      return typeof Math[prop] === 'function'
    })

    // 遍历每个 Math 方法
    for (let method of mathMethods) {
      // 构建正则表达式，用于匹配该 Math 方法的调用
      const regex = new RegExp(`(?<![a-zA-Z])${method}\\(([^)]*)\\)`, 'g')
      // 使用 replace 方法将匹配到的方法调用替换为带 Math 前缀的形式
      // str = str.replace(regex, `Math.${method}($1)`)
      if (type === 2) {
        str = str.replace(regex, `Math.${method}($1)`)
      } else if (type === 3) {
        str = str.replace(/__hanshufengefu__/g, ',')
      }
    }
    for (let index = 0; index < customFunctionsKeys.length; index++) {
      const fun = customFunctionsKeys[index]
      const regex = new RegExp(`(?<![a-zA-Z])${fun}\\(([^)]*)\\)`, 'g')
      if (type === 2) {
        str = str.replace(regex, `customFunctions.${fun}($1)`)
      } else if (type === 3) {
        str = str.replace(/__hanshufengefu__/g, ',')
      }
    }

    return str
  }
  /**
   * 返回字符串拆分的数组，主要是保证Math方法能够拆解出来，并把,替换为指定字符
   * @param str
   * @param replacement
   * @returns
   */
  public replaceCommasInNestedFunctions(str: string, replacement = '__hanshufengefu__') {
    let result = ''
    let stack = []
    let currentPart = ''

    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      if (char === '(') {
        if (currentPart) {
          result += currentPart
          currentPart = ''
        }
        stack.push('(')
        result += char
      } else if (char === ')') {
        if (stack.length > 0) {
          stack.pop()
          currentPart = currentPart.replace(/,/g, replacement)
          result += currentPart + char
          currentPart = ''
        } else {
          // 多余右括号，直接添加到结果
          result += currentPart + char
          currentPart = ''
        }
      } else if (char === ',') {
        if (stack.length > 0) {
          currentPart += replacement
        } else {
          currentPart += char
        }
      } else {
        currentPart += char
      }
    }

    // 处理剩余未闭合的括号和剩余部分
    result += currentPart
    result += ')'.repeat(stack.length)

    return result
  }

  /**
   *被单引号或双引号包裹的字符串的,和;替换，结束会换回来，确保不被解析成 && 和 ||
   * @param str
   * @param from
   * @param to
   * @returns
   */
  public replaceCharsInQuotes(str: string, from: string, to: string) {
    if (typeof str !== 'string' || typeof from !== 'string' || typeof to !== 'string') {
      throw new Error('输入参数必须为字符串类型')
    }

    let inQuotes = false
    let quoteType = ''
    let result = ''
    let i = 0

    while (i < str.length) {
      const char = str[i]

      if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
        if (inQuotes && char === quoteType) {
          inQuotes = false
        } else if (!inQuotes) {
          inQuotes = true
          quoteType = char
        }
      }

      if (inQuotes && str.slice(i, i + from.length) === from) {
        result += to
        i += from.length
      } else {
        result += char
        i++
      }
    }

    return result
  }
  /**
   * 字符串是否被单引号或者双引号包裹
   * @param str
   * @returns
   */
  public isQuoted(str: string | any[]) {
    const length = str.length
    return (
      length >= 2 &&
      ((str[0] === '"' && str[length - 1] === '"') || (str[0] === "'" && str[length - 1] === "'"))
    )
  }
  private shouldMatchItem(validOperators: ('+' | '-' | '*' | '/' | '%')[]) {
    const basePattern = '__hanshufengefu__'

    // 1. 处理空数组情况
    if (!validOperators || validOperators.length === 0) {
      return new RegExp(`(${basePattern})`)
    }

    // 2. 安全构建字符类
    // 重点：在正则 [] 中，'-' 必须转义，否则会报错或变成范围符 (如 a-z)
    const safeOps = validOperators
      .map((op) => {
        if (op === '-') return '\\-' // 强制转义连字符
        if (op === '*') return '\\*' // 转义星号（虽在[]中非必须，但更规范）
        return op
      })
      .join('')

    // 3. 组合正则
    // 这里的 () 是作为固定字符包含在内的
    const opsClass = `[${safeOps}()]`

    return new RegExp(`(${opsClass}|${basePattern})`)
  }
  /**
   * 返回转化后的字符串，变量可以被对象使用，Math的方法可以被使用
   * @param str
   * @returns
   */
  public returnString(str: string) {
    if (this.isQuoted(str)) {
      return str
    }
    str = str.replace(/\s/g, '')

    const arr = this.splitFunctionString(str)

    // 过滤掉空字符串
    if (arr.length > 0) {
      arr.forEach((item: string, index: number) => {
        if (
          !this.isQuoted(item) &&
          (!arr[index + 1] || arr[index + 1] !== '(') &&
          !this.operatorRegex.test(item) &&
          isNaN(Number(item)) &&
          !item.startsWith("'")
        ) {
          arr[
            index
          ] = `(variableDict['${item}'] === undefined ? '${item}' : variableDict['${item}'])`
        }
      })
      str = arr.join('')
    }
    return this.convertToMathMethods(str, 2)
  }
  /**
   * 根据比较运算符分割字符串，比较运算符如果被单引号或双引号包裹，不会被分割
   * @param str
   * @returns
   */
  public splitByComparisonOperators(str) {
    const result = []
    let current = ''
    let inQuotes = false
    let quoteType = null

    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      if ((char === '"' || char === "'") && (!inQuotes || char === quoteType)) {
        inQuotes = !inQuotes
        quoteType = inQuotes ? char : null
      }

      if (!inQuotes) {
        const possibleTripleOp = str.slice(i, i + 3)
        if (possibleTripleOp === '===') {
          if (current) {
            result.push(current.trim())
            current = ''
          }
          i += 2
        } else {
          const possibleDoubleOp = str.slice(i, i + 2)
          if (
            possibleDoubleOp === '==' ||
            possibleDoubleOp === '!=' ||
            possibleDoubleOp === '>=' ||
            possibleDoubleOp === '<='
          ) {
            if (current) {
              result.push(current.trim())
              current = ''
            }
            i++
          } else if (char === '>' || char === '<') {
            if (current) {
              result.push(current.trim())
              current = ''
            }
          } else {
            current += char
          }
        }
      } else {
        current += char
      }
    }

    if (current) {
      result.push(current.trim())
    }

    return result
  }
  /**
   * 解析并替换表达式的函数（
   * 例如  (来源=上，(来源=下；max(长度，宽度+框长)>20))转化为(variableDict['来源']==='上' && (variableDict['来源']==='下' || Math.max(variableDict['长度'],variableDict['宽度']+variableDict['框长'])>20))）
   * 其中各个实体维护在variableDict中，此变量为一个对象，其中的来源为变量属性，也可能为空
   * @param expression 变量表达式字符串
   * @returns
   */
  public parseAndReplace(expression: string): string {
    try {
      // 转换中文标点符号
      const cleanedExpression = this.convertChinesePunctuationToEnglish(expression)

      // 因为,会解析成&&，但是函数中的,不需要转换，所以先把,转换成__hanshufengefu__
      let trimmedExpression = this.replaceCommasInNestedFunctions(cleanedExpression)

      trimmedExpression = this.replaceCharsInQuotes(trimmedExpression, ',', '__douhaozifuchuan__')
      trimmedExpression = this.replaceCharsInQuotes(trimmedExpression, ';', '__fenhaozifuchuan__')

      // 按分号分割成或关系的部分
      const parts = trimmedExpression.split(';')
      const orExpressions: string[] = []

      // 定义比较运算符
      const comparisonOperators: string[] = ['===', '>=', '<=', '>', '<', '!=', '==']

      for (const part of parts) {
        // 按逗号分割成与关系的子部分
        const subParts = part.split(',')
        const andExpressions: string[] = []

        for (let subPart of subParts) {
          let ishaveComparisonOperators = false
          // 处理比较表达式右侧的值，如果不是纯粹的数字，需要加引号
          for (const operator of comparisonOperators) {
            if (subPart.includes(operator)) {
              ishaveComparisonOperators = true
              const parts = this.splitByComparisonOperators(subPart)
              if (parts.length === 2) {
                let left = parts[0]
                let right = parts[1]

                left = this.returnString(left)
                right = this.returnString(right)
                subPart = `${left}${operator}${right}`
              }
              break
            }
          }
          // 如果不是等式
          if (!ishaveComparisonOperators) {
            subPart = this.returnString(subPart)
          }
          andExpressions.push(subPart)
        }

        orExpressions.push(andExpressions.join(' && '))
      }
      const result = this.replaceCharsInQuotes(
        this.replaceCharsInQuotes(
          this.convertToMathMethods(orExpressions.join(' || '), 3),
          '__douhaozifuchuan__',
          ','
        ),
        '__fenhaozifuchuan__',
        ';'
      )
      return result
    } catch (error) {
      return expression
    }
  }

  /**
   * 获取表达式计算结果的函数
   * @param variableDict 对象
   * @returns
   */
  public getCountResult(
    expressionString: string,
    variableDict: { [key: string]: string | number },
    errorCallback?: (error: any) => void
  ): any | undefined {
    if (!expressionString) {
      return undefined
    }
    try {
      // 使用 Function 方法运行生成的字符串
      const evaluationResult = Function(
        'variableDict',
        'customFunctions',
        '"use strict";return (' + expressionString + ')'
      )(variableDict, customFunctions)
      return evaluationResult
    } catch (error) {
      console.log('执行表达式时出错: ', error)
      if (errorCallback) {
        errorCallback({
          error,
          expressionString,
        })
      }
    }
    return undefined
  }
  static getCalculatedData(
    str: string,
    attrs: {
      [key: string]: any
    },
    ignoreOperators: ('+' | '-' | '*' | '/' | '%')[] = [],
    errorCallback?: (error: any) => void
  ) {
    const tvariableCompilation = TvariableCompilation.getInstance()
    tvariableCompilation.setIgnoreOperators(ignoreOperators)
    const funstr = tvariableCompilation.parseAndReplace(str)
    return tvariableCompilation.getCountResult(
      funstr,
      attrs,
      errorCallback
        ? (error) => {
            errorCallback({
              ...error,
              str,
            })
          }
        : undefined
    )
  }
}
export { TvariableCompilation }
