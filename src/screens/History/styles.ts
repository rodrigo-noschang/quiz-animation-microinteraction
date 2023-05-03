import { StyleSheet } from 'react-native';

import { THEME } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.GREY_800,
  },

  history: {
    padding: 32,
    flexGrow: 1
  },

  swipeableContainer: {
    backgroundColor: THEME.COLORS.DANGER_LIGHT,
    height: 90,
    marginBottom: 12,
    borderRadius: 6
  },

  swipeableRemove:{
    width: 90,
    height: 90,
    borderRadius: 6,
    backgroundColor: THEME.COLORS.DANGER_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  }
});