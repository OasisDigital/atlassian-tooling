/* eslint-disable */
export default {
  displayName: 'atlassian-forge-nx-plugin',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/atlassian-forge-nx-plugin',
};
