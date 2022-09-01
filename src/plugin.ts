import {
	BaseInputParams,
	BindingTarget,
	InputBindingPlugin,
	ParamsParsers,
	parseParams,
} from '@tweakpane/core';

import {TextAreaController} from './controller';

export interface PluginInputParams extends BaseInputParams {
	view: 'textarea';
	lineCount?: number;
	placeholder?: string;
	readOnly: boolean;
}

// NOTE: You can see JSDoc comments of `InputBindingPlugin` for details about each property
//
// `InputBindingPlugin<In, Ex, P>` means...
// - The plugin receives the bound value as `Ex`,
// - converts `Ex` into `In` and holds it
// - P is the type of the parsed parameters
//
export const TweakpaneTextareaPlugin: InputBindingPlugin<
	string,
	string,
	PluginInputParams
> = {
	id: 'input-template',

	// type: The plugin type.
	// - 'input': Input binding
	// - 'monitor': Monitor binding
	type: 'input',

	// This plugin template injects a compiled CSS by @rollup/plugin-replace
	// See rollup.config.js for details
	css: '__css__',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (typeof exValue !== 'string') {
			// Return null to deny the user input
			return null;
		}

		// Parse parameters object
		// console.log(params)
		const p = ParamsParsers;
		const result = parseParams<PluginInputParams>(params, {
			// `view` option may be useful to provide a custom control for primitive values
			view: p.required.constant('textarea'),
			lineCount: p.optional.number,
			placeholder: p.optional.string,
			readOnly: p.optional.boolean,
		});
		if (!result) {
			return null;
		}

		// Return a typed value and params to accept the user input
		return {
			initialValue: exValue,
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: unknown): string => {
				// Convert an external unknown value into the internal value
				return typeof exValue === 'string' ? exValue : '';
			};
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				// Use `target.write()` to write the primitive value to the target,
				// or `target.writeProperty()` to write a property of the target
				target.write(inValue);
			};
		},
	},

	controller(args) {
		// Create a controller for the plugin
		return new TextAreaController(args.document, {
			value: args.value,
			lineCount: args.params.lineCount ?? 3,
			placeholder: args.params.placeholder ?? 'Enter text here',
			readOnly: args.params.readOnly ?? false,
			viewProps: args.viewProps,
		});
	},
};
