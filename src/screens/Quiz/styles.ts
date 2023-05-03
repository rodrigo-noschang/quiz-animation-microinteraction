import { StyleSheet } from 'react-native';
import { THEME } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.GREY_800,
  },
  quizHeader: {
    width: '100%',
    marginBottom: 21,
  },
  question: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 300,
    padding: 32,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  title: {
    fontSize: 16,
    color: THEME.COLORS.GREY_100,
    fontFamily: THEME.FONTS.BOLD,
    textAlign: 'center',
    marginBottom: 5
  }
});