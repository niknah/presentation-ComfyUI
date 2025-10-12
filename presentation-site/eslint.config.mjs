import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
	{
		// ignores come first
		// https://github.com/nuxt/eslint/discussions/413
		ignores:[
			"components/tabs/**",
			"components/Tablist.vue",
		],
	},
	{
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
			'vue/prop-name-casing': 'off',
			// Need to use... :xxx="`a === b`"
			'vue/no-useless-v-bind': 'off',
		},
	},
])
