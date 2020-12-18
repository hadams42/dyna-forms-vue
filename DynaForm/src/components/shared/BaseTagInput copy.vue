<template>
    <div class="tags-input-root" style="position: relative">
        <div :class="wrapperClass + ' tags-input'">
            <span class="tags-input-badge tags-input-badge-pill tags-input-badge-selected-default"
                v-for="(badge, index) in tagBadges"
                :key="index"
								:style="{'color': getTagColorByText(badge)}"
            >
                <span v-html="badge"></span>

                <i v-if="viewOnly == false" 
									href="#" 
									class="tags-input-remove" 
									@click.prevent="removeTag(index)"
								></i>
            </span>
            <input v-if="viewOnly == false"
								type="text"
                ref="taginput"
                :placeholder="placeholder"
                v-model="input"
                @keydown.enter.prevent="tagFromInput"
                @keydown.tab="tagFromInput"
                @keydown.8="removeLastTag"
                @keydown.down="nextSearchResult"
                @keydown.up="prevSearchResult"
                @keydown="onKeyDown"
                @keyup="searchTag"
                @keyup.esc="ignoreSearchResults"
                @focus="onFocus"
                @blur="onBlur"
                @value="tags">

            <input type="hidden" v-if="elementId"
                :name="elementId"
                :id="elementId"
                v-model="hiddenInput">
        </div>

        <!-- Typeahead/Autocomplete -->
        <div v-show="searchResults.length && viewOnly == false">
            <p v-if="typeaheadStyle === 'badges'" :class="'typeahead-${typeaheadStyle}'">
                <span v-for="(tag, index) in searchResults"
                    :key="index"
                    v-text="tag.text"
                    @mouseover="searchSelection = index"
                    @mousedown.prevent="tagFromSearchOnClick(tag)"
                    class="tags-input-badge"
										:style="{'background-color': getTagBackgroundColor(tag), 'color': getTagColor(tag)}"
                    v-bind:class="{
                        'tags-input-typeahead-item-default': index != searchSelection,
                        'tags-input-typeahead-item-highlighted-default': index == searchSelection
                    }"></span>
            </p>

            <ul v-else-if="typeaheadStyle === 'dropdown'" :class="'typeahead-${typeaheadStyle}'">
                <li v-for="(tag, index) in searchResults"
                :key="index"
                v-text="tag.text"
                @mouseover="searchSelection = index"
                @mousedown.prevent="tagFromSearchOnClick(tag)"
                v-bind:class="{
                    'tags-input-typeahead-item-default': index != searchSelection,
                    'tags-input-typeahead-item-highlighted-default': index == searchSelection
                }"></li>
            </ul>
        </div>
    </div>
</template>

<script>

//This componnent's code is Copyright (c) 2017 Alexander Zavyalov
//MIT license. See https://github.com/voerro/vue-tagsinput

export default {

    props: {
        elementId: String,

				existingTagsConcat: {
            type: String,
            default: ""
				},
				existingColorsConcat: {
            type: String,
            default: ""
				},
				existingBackgroundColorsConcat: {
            type: String,
            default: ""
				},

				viewOnly: {
            type: Boolean,
            default: false
				},
        value: {
            type: [Array, String],
            default: () => {
                return [];
            }
        },
        typeahead: {
            type: Boolean,
            default: false
        },

        defaultColor: {
            type: String,
            default: '#080808;'
				},
				
        defaultBackgroundColor: {
            type: String,
            default: '#fefefe'
        },

        typeaheadStyle: {
            type: String,
            default: 'badges'
        },

        typeaheadActivationThreshold: {
            type: Number,
            default: 1
        },

        typeaheadMaxResults: {
            type: Number,
            default: 0
        },

        placeholder: {
            type: String,
            default: 'Add a tag'
        },

        limit: {
            type: Number,
            default: 0
        },

        onlyExistingTags: {
            type: Boolean,
            default: false
        },

        deleteOnBackspace: {
            type: Boolean,
            default: true
        },

        allowDuplicates: {
            type: Boolean,
            default: false
        },
        
        validate: {
            type: Function,
            default: () => true
        },

        addTagsOnComma: {
            type: Boolean,
            default: false
        },

        wrapperClass: {
            type: String,
            default: 'tags-input-wrapper-default'
        },
    },

    data() {
        return {
            badgeId: 0,
            tagBadges: [],
            tags: [],
						existingTags: this.existingTagsConcat == false ? [] : this.existingTagsConcat.split("|"),
						existingColors: this.existingColorsConcat == false ? [] : this.existingColorsConcat.split(","),
						existingBackgroundColors: this.existingBackgroundColorsConcat == false ? [] : this.existingBackgroundColorsConcat.split(","),

            input: '',
            oldInput: '',
            hiddenInput: '',

            searchResults: [],
            searchSelection: 0,
        };
    },

    created () {
        this.tagsFromValue();

        // Emit an event
        this.$emit('initialized');
    },

    watch: {
        tags() {
            // Updating the hidden input
            this.hiddenInput = this.tags.join(',');

            // // Update the bound v-model value
            // this.$emit('input', this.tags);
        },

        value() {
            this.tagsFromValue();
        }
    },

    methods: {

				getTagColor(tag) {
					var i=0;
					for (let slug in this.existingTags) {
							if (slug == tag.slug) {
									try {
										return this.existingColors[i];
									} catch (e) {
									}
							}
							i=i+1;
					}
					return this.defaultColor;
				},

				getTagBackgroundColor(tag) {
					var i=0;
					for (let slug in this.existingTags) {
							if (slug == tag.slug) {
									try {
										return this.existingBackgroundColors[i];
									} catch (e) {
									}
							}
							i=i+1;
					}
					return this.defaultBackgroundColor;
				},

				getTagColorByText(text) {
					for (var i=0; i<this.existingTags.length; i++) {
						var escapedText = this.existingTags[i];
							if (escapedText == text) {
									try {
										return this.existingColors[i];
									} catch (e) {
									}
							}
					}
					return this.defaultColor;
				},

				// getTagBackgroundColorByText(text) {
				// 	for (var i=0; i<this.existingTags.length; i++) {
				// 		var escapedText = this.existingTags[i];
				// 			if (escapedText == text) {
				// 					try {
				// 						return this.existingBackgroundColors[i];
				// 					} catch (e) {
				// 					}
				// 			}
				// 	}
				// 	return this.defaultBackgroundColor;
				// },


        escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },

        tagFromInput() {
            // If we're choosing a tag from the search results
            // if (this.searchResults.length && this.searchSelection >= 0) {
            //     this.tagFromSearch(this.searchResults[this.searchSelection]);

            //     this.input = '';
						// } else 
						{
                // If we're adding a non-existing tag
                let text = this.input.trim();

                // If the new tag is not an empty string and passes validation
                if (!this.onlyExistingTags && text.length && this.validate(text)) {
                    this.input = '';

                    // Determine the tag's slug and text depending on if the tag exists
                    // on the site already or not
                    let slug = this.makeSlug(text);
                    let existingTag = this.existingTags[slug];

                    slug = existingTag ? slug : text;
                    text = existingTag ? existingTag : text;

                    this.addTag(slug, text);
                } else {
									this.input = '';
								}
            }
				},

        tagFromSearchOnClick(tag) {
            this.tagFromSearch(tag);

            this.$refs['taginput'].blur();
        },

        tagFromSearch(tag) {
            this.searchResults = [];
            this.input = '';
            this.oldInput = '';

            this.addTag(tag.slug, tag.text);
        },

        makeSlug(value) {
            return value.toLowerCase().replace(/\s/g, '-');
        },

        addTag(slug, text) {
            // Check if the limit has been reached
            if (this.limit > 0 && this.tags.length >= this.limit) {
                return false;
						}
						
						if (this.tags == false) {
							this.tags = [];
						}

            // Attach the tag if it hasn't been attached yet
            if (!this.tagSelected(slug)) {
                this.tagBadges.push(text);//.replace(/\s/g, '&nbsp;'));
                this.tags.push(slug);
            }

            // Emit events
            this.$emit('tag-added', slug);
            this.$emit('tags-updated', this.tags);
        },

        removeLastTag() {
            if (!this.input.length && this.deleteOnBackspace) {
                this.removeTag(this.tags.length - 1);
            }
        },

        removeTag(index) {
						if (this.tags == false || this.tags.length < index) return;
            let slug = this.tags[index];

            this.tags.splice(index, 1);
            this.tagBadges.splice(index, 1);

            // Emit events
            this.$emit('tag-removed', slug);
            this.$emit('tags-updated', this.tags);
        },

        searchTag() {
            if (this.typeahead === true) {
                if (this.oldInput != this.input || (!this.searchResults.length && this.typeaheadActivationThreshold == 0)) {
                    this.searchResults = [];
                    this.searchSelection = 0;
                    let input = this.input.trim();

                    if ((input.length && input.length >= this.typeaheadActivationThreshold) || this.typeaheadActivationThreshold == 0) {
                        for (let slug in this.existingTags) {
                            let text = this.existingTags[slug].toLowerCase();

                            if (text.search(this.escapeRegExp(input.toLowerCase())) > -1 && ! this.tagSelected(slug)) {
                                this.searchResults.push({ slug, text: this.existingTags[slug] });
                            }
                        }

                        // Sort the search results alphabetically
                        this.searchResults.sort((a, b) => {
                            if (a.text < b.text) return -1;
                            if (a.text > b.text) return 1;

                            return 0;
                        });

                        // Shorten Search results to desired length
                        if (this.typeaheadMaxResults > 0) {
                            this.searchResults = this.searchResults.slice(
                                0,
                                this.typeaheadMaxResults
                            );
                        }
                    }

                    this.oldInput = this.input;
                }
            }
        },

        onFocus() {
            this.searchTag();
        },

        onBlur() {
					this.hideTypeahead();
					this.tagFromInput();
        },

        hideTypeahead() {
            if (! this.input.length) {
                this.$nextTick(() => {
                    this.ignoreSearchResults();
                });
            }
        },

        nextSearchResult() {
            if (this.searchSelection + 1 <= this.searchResults.length - 1) {
                this.searchSelection++;
            }
        },

        prevSearchResult() {
            if (this.searchSelection > 0) {
                this.searchSelection--;
            }
        },

        ignoreSearchResults() {
            this.searchResults = [];
            this.searchSelection = 0;
        },

        /**
        * Clear the list of selected tags
        */
        clearTags() {
						if (this.tags != false && this.tags.length  {
							this.tags.splice(0, this.tags.length);
							this.tagBadges.splice(0, this.tagBadges.length);
						}
        },

        /**
        * Replace the currently selected tags with the tags from the value
        */
        tagsFromValue() {
            if (this.value && this.value.length) {
                let tags = Array.isArray(this.value)
                    ? this.value
                    : this.value.split(',');

                if (this.tags == tags) {
                    return;
                }

                this.clearTags();

                for (let slug of tags) {
                    let existingTag = this.existingTags[slug];
                    let text = existingTag ? existingTag : slug;

                    this.addTag(slug, text);
                }
            } else {
                if (this.tags != false && this.tags.length == 0) {
                    return;
                }

                this.clearTags();
            }
        },

        /**
        * Check if the tag with the provided slug is already selected
        */
        tagSelected(slug) {
            if (this.allowDuplicates) {
                return false;
            }

            if (! slug) {
                return false;
						}
						
						if (this.tags == false) return;

            let searchSlug = this.makeSlug(slug);
            let found = this.tags.find((value) => {
                return searchSlug == this.makeSlug(value);
            });

            return !! found;
        },

        /**
         * Process all the keydown events
         */
        onKeyDown(e) {
            // Insert a new tag on comma keydown if the option is enabled
            if (e.key == ',') {
                if (this.addTagsOnComma) {
                    // The comma shouldn't actually be inserted
                    e.preventDefault();

                    // Add the inputed tag
                    this.tagFromInput();
                }
            }
        },
    }
}
</script>
