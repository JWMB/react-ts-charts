import { DateRange, MyDate } from './dateRange';

it('renders without crashing', () => {
    const ranges = [['xx-12-01', 'xx-01-10'], ['xx-03-05', 'xx-04-03']]
        .map(pairs => pairs.map(p => MyDate.parse(p)) as [MyDate, MyDate]);
    const f = DateRange.createMultiGetIsInRangeFunction(ranges);
    expect(f(new Date(2000, 0, 1))).toBe(true);
});
  