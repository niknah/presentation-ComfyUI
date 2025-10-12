
import antfu from '@antfu/eslint-config'

export default antfu({
	rules: {
		'style/semi': 'off',
		'no-console': 'off',
		'style/brace-style': 'off',
		'@stylistic/comma-dangle': [0, {"only-multiline": true}],
		'vue/prop-name-casing': 'off',
		'vue/singleline-html-element-content-newline': 'off',
		'style/quotes': 'off',
		'vue/html-self-closing': [0, {
			"html": {
				'normal': 'always',
				'component': 'always',
			},
		}],
		// Need to use... :xxx="`a === b`"
		'vue/no-useless-v-bind': 'off',
	},
	ignores: [
		"components/tabs',
	]
})
