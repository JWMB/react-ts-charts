import { DateRange, SimpleDate } from './dateRange';

it('renders without crashing', () => {
    const ranges = [['xx-12-01', 'xx-01-10'], ['xx-03-05', 'xx-04-03']]
        .map(pairs => pairs.map(p => SimpleDate.parse(p)) as [SimpleDate, SimpleDate]);
    const f = DateRange.createMultiGetIsInRangeFunction(ranges);
    expect(f(new Date(2000, 0, 1))).toBe(true);
});
  