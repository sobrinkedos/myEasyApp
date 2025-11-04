import { colors, primary, secondary, neutral, feedback } from './colors';

describe('Colors', () => {
  describe('Primary colors', () => {
    it('should have all scale values', () => {
      expect(primary).toHaveProperty('50');
      expect(primary).toHaveProperty('100');
      expect(primary).toHaveProperty('500');
      expect(primary).toHaveProperty('900');
    });

    it('should have correct main color', () => {
      expect(primary[500]).toBe('#FF7A4D');
    });
  });

  describe('Secondary colors', () => {
    it('should have all scale values', () => {
      expect(secondary).toHaveProperty('50');
      expect(secondary).toHaveProperty('500');
      expect(secondary).toHaveProperty('900');
    });

    it('should have correct main color', () => {
      expect(secondary[500]).toBe('#22C55E');
    });
  });

  describe('Neutral colors', () => {
    it('should have white and black', () => {
      expect(neutral[0]).toBe('#FFFFFF');
      expect(neutral[950]).toBe('#0A0A0A');
    });
  });

  describe('Feedback colors', () => {
    it('should have all feedback colors', () => {
      expect(feedback).toHaveProperty('success');
      expect(feedback).toHaveProperty('error');
      expect(feedback).toHaveProperty('warning');
      expect(feedback).toHaveProperty('info');
    });
  });

  describe('Colors export', () => {
    it('should export all color groups', () => {
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('neutral');
      expect(colors).toHaveProperty('feedback');
      expect(colors).toHaveProperty('orderStatus');
      expect(colors).toHaveProperty('tableStatus');
    });
  });
});
