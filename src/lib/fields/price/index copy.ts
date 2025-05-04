/** @format */

type IOptions = {
  seprator: '/' | ',';
  precision: number;
  pretty: boolean;
};

type IPrice = {
  keyboardEventValidator: (
    $e: KeyboardEvent,
    entryOptions: Partial<Pick<IOptions, 'precision'>>
  ) => boolean;
  make: (value: string, entryOptions: Partial<IOptions>) => string;
};

class Price implements IPrice {
  constructor() {}
  private getValidContentRegex = (precision: number) => {
    const regexWithPrecision = new RegExp(`^\\d+\\.?\\d{0,${precision}}$`);
    const regexWithoutPrecision = new RegExp('^\\d*$');
    if (precision == 0) {
      return regexWithoutPrecision;
    } else {
      return regexWithPrecision;
    }
  };
  private getSingleModeRegex = (precision: number) => {
    let supportedKeys = [
      ...(precision == 0 ? [] : ['Decimal', 'Period']),
      'Backspace',
      'Alt',
      'Control',
      'Shift',
      'Escape',
      'Tab',
      'Delete',
      'Home',
      'End',
      'Left',
      'Up',
      'Right',
      'Down',
      'Enter',
      'Numpad\\d',
      'Digit\\d',
    ];
    let singleModeRegex = new RegExp(`(${supportedKeys.join('|')})+`);
    // const singleModeRegex =
    //   /(Decimal|Period|Backspace|Alt|Control|Shift|Escape|Tab|Delete|Home|End|Left|Up|Right|Down|Enter|Numpad\d|Digit\d)+/;
    return singleModeRegex;
  };
  // @ts-ignore
  private validByPrecision = (value: string, precision: number) => {
    const validContentRegex = this.getValidContentRegex(precision);
    const isValidEntry = validContentRegex.test(value);
    if (isValidEntry == true) {
      return true;
    } else {
      return false;
    }
  };
  private getKeyboardEventMode = ($e: KeyboardEvent) => {
    const { altKey, shiftKey, ctrlKey } = $e;
    const isActiveMultiKey = [altKey, shiftKey, ctrlKey].some((item) => {
      return item == true;
    });
    if (isActiveMultiKey == true) {
      return 'multi';
    } else {
      return 'single';
    }
  };

  private controlDot = (value: string) => {
    let endsWithDot = value.endsWith('.');
    let startWithDot = value.startsWith('.');
    let valueWithoutDot = value.replace(/\.$/, '');
    return {
      startWithDot,
      endsWithDot,
      valueWithoutDot,
      controllDot: (value: string) => {
        if (endsWithDot == true) {
          return value + '.';
        } else {
          return value;
        }
      },
      controllZiro: (value: string) => {
        if (startWithDot == true) {
          return '0' + value;
        } else {
          return value;
        }
      },
    };
  };
  // @ts-ignore
  private contentValidator = (value: string, precision: number) => {
    const validContentRegex = this.getValidContentRegex(precision);
    const isValidEntry = validContentRegex.test(value);
    if (isValidEntry == true) {
      return true;
    } else {
      return false;
    }
  };
  private makeValidContent = (value: string, precision: number) => {
    let output = value;
    let dotController = this.controlDot(output);
    if (dotController.endsWithDot == true) {
      output = dotController.valueWithoutDot;
    }

    output = dotController.controllZiro(output);

    const validContentRegexWithPrecision = /\d+(\.\d+)?/g;
    const validContentRegexWithoutRegex = /\d+/g;

    if (precision == 0) {
      const matchValue = output.match(validContentRegexWithoutRegex)?.join('');

      return matchValue || '';
    } else {
      output = output.match(validContentRegexWithPrecision)?.join('') || '';
      const hasPrecision = output.includes('.');
      if (hasPrecision) {
        const [integer, decimal] = output.split('.');

        output = `${integer}.${decimal.slice(0, precision)}`;
        output = dotController.controllDot(output);

        return output;
      } else {
        output = dotController.controllDot(output);
        return output;
      }
    }
  };
  private prettyPrint = (value: string, seprator: string = ',') => {
    const hasPrecision = value.includes('.');
    if (hasPrecision) {
      let [integer, decimal] = value.split('.');
      integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, seprator);
      return `${integer}.${decimal}`;
    } else {
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, seprator);
    }
  };
  public keyboardEventValidator = (
    $e: KeyboardEvent,
    entryOptions: Partial<Pick<IOptions, 'precision'>> = {}
  ) => {
    const options = { precision: 2, ...entryOptions };
    const singleModeRegex = this.getSingleModeRegex(options.precision);
    const multiModeRegex =
      /(Key(?:A|Z|X|C|V)|Arrow(?:Left|Up|Right|Down)|Backspace|Alt|Control|Shift|Escape|Tab|Delete|Home|End)+/;
    const eventMode = this.getKeyboardEventMode($e);
    if (eventMode == 'single') {
      const isValidEntry = singleModeRegex.test($e.code);
      if (isValidEntry == true) {
        return true;
      } else {
        return false;
      }
    } else {
      const isValidEntry = multiModeRegex.test($e.code);
      if (isValidEntry == true) {
        return true;
      } else {
        return false;
      }
    }
  };
  public make(value: string, entryOptions: Partial<IOptions> = {}) {
    const options: IOptions = {
      seprator: ',',
      precision: 2,
      pretty: false,
      ...entryOptions,
    };
    let output = this.makeValidContent(value, options.precision);
    if (entryOptions.pretty == true) {
      output = this.prettyPrint(output, entryOptions.seprator);
    }
    return output;
  }
}

const use = (): IPrice => {
  return new Price();
};
