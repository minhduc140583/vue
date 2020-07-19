import {LocaleFormatter} from 'onecore';
import {addParametersIntoUrl, append, buildSearchMessage, changePage, changePageSize, formatResults, getDisplayFields, getPageTotal, handleSortEvent, optimizeSearchModel, reset, Searchable, showResults} from 'search-utilities';
import {UIService} from '../ui';
import {storage} from '../storage';
import {SearchPermissionBuilder} from '../permission/SearchPermissionBuilder';
import {BaseViewComponent} from "./BaseViewComponent";

export interface SearchModel {
  page?: number;
  limit: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;
  currentUserId?: string;

  keyword?: string;
  excluding?: Map<string, any>;
  refId?: string|number;
}

export interface SearchResult<T> {
  total?: number;
  results: T[];
  last?: boolean;
}

export interface SearchService<T, S extends SearchModel> {
  search(s: S): Promise<SearchResult<T>>;
}

import {Component} from "vue-property-decorator";

@Component
export class SearchComponent<T = any, S extends SearchModel = any> extends BaseViewComponent {
  protected service: SearchService<T, S>;
  protected permissionBuilder: SearchPermissionBuilder = null;
  protected autoSearch = true;

  Constructor(
    service: SearchService<T, S>,
    permissionBuilder: SearchPermissionBuilder = null,
    autoSearch = true) {
    this.supperContructor();
    this.service = service;
    this.permissionBuilder = permissionBuilder;
    this.autoSearch = autoSearch;
    this.uiS2 = storage.ui();
    const r = storage.resource();
    this.deleteHeader = r.value('msg_delete_header');
    this.deleteConfirm = r.value('msg_delete_confirm');
    this.deleteFailed = r.value('msg_delete_failed');
  }

  private uiS2: UIService;

  // listForm: any;
  formatter: LocaleFormatter<T>;
  tagName: string;
  displayFields: any[];
  initDisplayFields = false;
  _triggerSearch = false;
  _loaded = false;
  showPaging = false;
  appendMode = false;
  appendable = false;
  index: number;
  pageMaxSize = 7;
  _tmpPageIndex: number;
  _bkpageIndex: number;
  pageIndex = 1;
  pageSize = 10;
  initPageSize = 20;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 10000];
  // pageSizes = ['10', '20', '40'];
  pageTotal: number;
  itemTotal: number = 0;
  sortField: string;
  _currentSortField: string;
  sortType: string;
  sortTarget: any;
  append = false;
  hideFilter: boolean;

  chkAll: any = null;
  _lastSearchedTime: any = null;
  result: any = null;
  /*
  gotoFirst = false;
  gotoLast = false;
  resultView: string;
  _tmpSelected: any;
  lastSelected: any;
  _hasMasonry: boolean = null;
  _masonryView: any = null;
  masonry: any = null;
*/
  searchable = true;
  viewable: boolean;
  addable: boolean;
  editable: boolean;
  approvable: boolean;
  deletable: boolean;

  protected state: S;
  protected list: any[] = [];
  private urlSearchModel: any;

  deleteHeader: string;
  deleteConfirm: string;
  deleteFailed: string;

  protected mergeUrlSearchModelToState() {
    const searchModel = this.urlSearchModel;
    if (searchModel) {
      for (const key of Object.keys(searchModel)) {
        if (searchModel[key] !== '') {
          this.state[key] = searchModel[key];
        }
      }
    }
  }

  autoInitForm() {
    const form: Element = this.$el.querySelector('form');
    if (form) {
      this.form = form;
      if (form.getAttribute('date-format') == null) {
        let df = this.dateFormat;
        if (df == null) {
          df = this.getDateFormat();
        }
        this.form.setAttribute('date-format', df);
      }
      const u = this.uiS2;
      const _this = this;
      setTimeout(function () {
        u.initMaterial(form);
        u.focusFirstControl(form);
        const result =  _this.$el.querySelector('.result');
        _this.result = result;
      }, 100);
      // this.initListForm(this.listForm);
    }
  }

  initData() {
    this.loadData();
  }

  initSearchModel() {
    const url = window.location.search;
    let obj = null;
    const tmp = storage.tmpSearchModel;
    if (tmp && tmp.tagName === this.tagName) {
      obj = tmp;
    }

    if (!obj) {
      obj = this.createSearchModel();
    }
    if (obj.pageSize) {
      this.pageSize = obj.pageSize;
    }
    if (!obj.pageSize && this.pageSize) {
      obj.pageSize = this.pageSize;
    }
    if (obj.initPageSize) {
      this.initPageSize = obj.initPageSize;
    } else {
      this.initPageSize = this.pageSize;
    }
    if (obj.sortField) {
      this.sortField = obj.sortField;
    }
    if (url) {
      if (url.includes('?')) {
        const paramValue = this.$route.query;
        this.urlSearchModel = paramValue;
      }
    }
    this.setSearchModel(obj);
  }

  resetSearchModel() {
    this.autoResetSearchModel(true);
  }

  autoResetSearchModel(bindToForm: boolean = null) {
    const obj = this.createSearchModel();
    const se = this.getOriginalSearchModel();
    obj.keyword = se.keyword;
    this.setSearchModel(obj);
    const com = this;
    const u = this.uiS2;
    setTimeout(function () {
      const form = com.getSearchForm();
      u.removeFormError(form);
      if (bindToForm) {
        u.bindToForm(form, obj);
      }
      com.searchOnClick(null);
    }, 100);
  }

  toggleFilter(event: any): void {
    this.hideFilter = !this.hideFilter;
  }

  initPermission() {
    if (this.permissionBuilder) {
      const permission = this.permissionBuilder.buildPermission(storage.getUser(), this._url);
      this.searchable = permission.searchable;
      this.viewable = permission.viewable;
      this.addable = permission.addable;
      this.editable = permission.editable;
      this.approvable = permission.approvable;
      this.deletable = permission.deletable;
      console.log('initPermission in search', permission)
    } else {
      this.searchable = true;
      this.viewable = false;
      this.addable = false;
      this.editable = false;
      this.approvable = false;
      this.deletable = false;
    }
  }

  loadData() {
    this.initSearchModel();
    const com = this;
    if (com.autoSearch) {
      this.mergeUrlSearchModelToState();
      setTimeout(function () {
        com._lastSearchedTime = new Date();
        com._bkpageIndex = com.pageIndex;
        com._loaded = true;
        com.doSearch(true);
      }, 100);
    }
  }

  protected SetSearchForm(form: any) {
    this.form = form;
  }

  protected getSearchForm(): any {
    return this.form;
  }

  createSearchModel(): S {
    const obj: any = {};
    return obj;
  }

  setSearchModel(obj: S) {
    this.formatSearchModel(obj);
    this.state = obj;
  }

  formatSearchModel(obj: S) {

  }

  getSearchModel(): S {
    const obj = this.populateSearchModel(this.state);
    return obj;
  }

  getOriginalSearchModel(): S {
    return this.state;
  }

  populateSearchModel(se: S = null): S {
    if (!se) {
      se = this.state;
    }
    let obj = this.uiS2.decodeFromForm(this.getSearchForm(), this.getLocale(), this.getCurrencyCode());
    obj = obj ? obj : {};
    if (this.tagName != null && this.tagName !== undefined) {
      se['tagName'] = this.tagName;
    }
    return optimizeSearchModel(obj, this, this.getDisplayFields());
  }

  protected getDisplayFields(): string[] {
    if (this.displayFields) {
      return this.displayFields;
    }
    if (!this.initDisplayFields) {
      if (this.form) {
        this.displayFields = getDisplayFields(this.form);
      }
      this.initDisplayFields = true;
    }
    return this.displayFields;
  }

  onPageSizeChanged(event) {
    const ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  }

  pageSizeChanged(size: number, event?) {
    this._lastSearchedTime = new Date();
    changePageSize(this, size);
    this._tmpPageIndex = 1;
    this._bkpageIndex = this.pageIndex;
    this.doSearch();
  }

  clearKeyworkOnClick = () => {
    this.state.keyword = '';
  }

  searchOnClick(event) {
    event.preventDefault();
    console.log(event);
    console.log(this);
    this._loaded = true;
    if (event) {
      this.SetSearchForm(event.target.form);
    }
    this.resetAndSearch();
  }

  resetAndSearch() {
    if (this.running === true) {
      this._triggerSearch = true;
      return;
    }
    this._lastSearchedTime = null;
    reset(this);
    this._tmpPageIndex = 1;
    this.doSearch();
  }

  doSearch(isFirstLoad?: boolean) {
    if (this.searchable !== true) {
      const r = storage.resource();
      const title = r.value('error_permission');
      const msg = r.value('error_permission_search');
      storage.alert().alertError(msg, title);
      const user = storage.getUser();
      if (user != null) {
        this.navigateToHome();
      } else {
        this.requireAuthentication();
      }
      return;
    } else {
      const listForm = this.getSearchForm();
      if (listForm) {
        this.uiS2.removeFormError(listForm);
      }
      const s: S = this.getSearchModel();
      storage.tmpSearchModel = s; // sessionStorage.setItem('searchEntity', JSON.stringify(se));
      const com = this;
      this.validateSearch(s, function (se2) {
        if (com.running === true) {
          return;
        }
        com.running = true;
        storage.loading().showLoading();
        // UISearchUtil.addParametersIntoUrl(s, isFirstLoad);
        com.search(s);
      });
    }
  }

  async search(se: S) {
    try {
      const result = await this.service.search(se);
      this.showResults(se, result);
    } catch (err) {
      this.handleError(err);
    }
  }

  validateSearch(se, callback: Function) {
    let valid = true;
    const listForm = this.getSearchForm();
    if (listForm) {
      valid = this.uiS2.validateForm(listForm, this.getLocale());
    }
    if (valid === true) {
      callback(se);
    }
  }

  searchError(response) {
    this.pageIndex = this._tmpPageIndex;
    this.handleError(response);
  }

  showResults(s: SearchModel, sr: SearchResult<T>) {
    const com = this;
    const results = sr.results;
    if (results != null && results.length > 0) {
      const locale = this.getLocale();
      formatResults(results, this.formatter, locale, 'sequenceNo', this.pageIndex, this.pageSize, this.initPageSize);
    }
    const appendMode = com.appendMode;
    this.index = -1;
    showResults(s, sr, com);
    // this.lastSelected = null;
    if (appendMode === false) {
      /*
      this.setList(results);
      this.showSearchMessage(sr);
      this.showPages(sr);
*/
      console.log('results', results)
      com.setList(results);
      com._tmpPageIndex = s.page;
      const r = storage.resource();
      storage.toast().showToast(buildSearchMessage(s, sr, r));
    } else {
      if (this.append === true && s.page > 1) {
        append(this.getList(), results);
      } else {
        this.setList(results);
      }
    }
    // this.changeUrlParams();
    this.running = false;
    storage.loading().hideLoading();
    if (this._triggerSearch === true) {
      this._triggerSearch = false;
      this.resetAndSearch();
    }
  }

  setList(results: T[]) {
    this.list = results;
  }

  getList(): any[] {
    return this.list;
  }

  sortPage(event, field?: string, sortType?: string) {
    if (event != null && event.target != null) {
      let target = event.target;
      if (target.nodeName === 'I') {
        target = target.parentNode;
      }
      if (!field) {
        field = target.getAttribute('data-field');
        if (!field) {
          field = target.parentNode.getAttribute('data-field');
        }
        if (!field || field.length === 0) {
          return;
        }
      }
      let i = null;
      if (target.children.length === 0) {
        target.innerHTML = target.innerHTML + '<i class="fa fa-caret-up" aria-hidden="true"></i>';
      } else {
        i = target.children[0];
        if (i.classList.contains('fa-caret-up')) {
          i.classList.remove('fa-caret-up');
          i.classList.add('fa-caret-down');
        } else if (i.classList.contains('fa-caret-down')) {
          i.classList.remove('fa-caret-down');
          i.classList.add('fa-caret-up');
        }
      }
      if (!this.sortField || this.sortField === '') {
        this.sortField = field;
        this.sortType = 'ASC';
      } else if (this.sortField !== field) {
        this.sortField = field;
        this.sortType = (!sortType ? 'ASC' : sortType);
        if (this.sortTarget != null && this.sortTarget.children.length > 0) {
          this.sortTarget.removeChild(this.sortTarget.children[0]);
        }
      } else if (this.sortField === field) {
        if (!sortType) {
          if (!this.sortType || this.sortType === 'ASC') {
            this.sortType = 'DESC';
          } else {
            this.sortType = 'ASC';
          }
        } else {
          this.sortType = sortType;
        }
      }
      this.sortTarget = target;
    } else {
      this.sortField = field;
      if (!this.sortType || this._currentSortField !== this.sortField || this.sortType === 'DESC') {
        this.sortType = 'ASC';
      } else {
        this.sortType = 'DESC';
      }

      this._currentSortField = this.sortField;
    }
    this._lastSearchedTime = null;
    // this.gotoFirst = false;
    // this.gotoLast = false;
    this.setList(null);
    if (this.appendMode === false) {
      this.doSearch();
    } else {
      this.resetAndSearch();
    }
  }

  showMore() {
    this.append = true;
    this._tmpPageIndex = this.pageIndex;
    this.pageIndex = this.pageIndex + 1;
    // this.gotoFirst = false;
    // this.gotoLast = false;
    this.doSearch();
  }

  pageChanged({pageIndex,itemsPerPage}, event) {
    console.log('pageChanged event', event);
    if (this._lastSearchedTime != null) {
      const now: any = new Date();
      const xbug = Math.abs(this._lastSearchedTime - now);
      console.log('xbug:' + xbug);
      if (xbug < 800) {
        this.pageIndex = this._bkpageIndex;
        return;
      }
    }
    changePage(this, event.page, event.itemsPerPage);
    this.doSearch();
  }
}
