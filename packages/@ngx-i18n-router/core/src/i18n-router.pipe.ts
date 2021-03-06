// angular
import { Injectable, Pipe, PipeTransform } from '@angular/core';

// libs
import * as _ from 'lodash';

// module
import { I18NRouterService, ROOT_ROUTE_PREFIX } from './i18n-router.service';

@Injectable()
@Pipe({
  name: 'i18nRouter',
  pure: false
})
export class I18NRouterPipe implements PipeTransform {
  constructor(private readonly i18nRouter: I18NRouterService) {
  }

  transform(value: string | Array<any>): string {
    if (typeof value === 'string' && _.get(value, 'length', 0))
      throw new Error('Query must be an empty string or an array!');

    if (!this.i18nRouter.languageCode || !this.i18nRouter.useLocalizedRoutes)
      return `/${typeof value === 'string' ? value : value.join('/')}`;

    if (_.get(value, 'length', 0) === 0)
      return `/${this.i18nRouter.languageCode}`;

    return `/${this.translateQuery(value)}`;
  }

  private translateQuery(value: string | Array<any>): string {
    const translateBatch: Array<any> = [];
    let batchKey = '';

    (value as Array<any>).forEach((segment: any, index: number) => {
      if (typeof segment === 'string') {
        let prefix = '';

        let currentKey = `${ROOT_ROUTE_PREFIX}.${segment}`;

        if (index === 0) {
          prefix = this.i18nRouter.getTranslation(currentKey);

          if (prefix) {
            batchKey = currentKey;
            translateBatch.push(this.i18nRouter.languageCode);
          }
        }

        currentKey = index === 0 ? (prefix ? batchKey : segment) : `${batchKey}.${segment}`;
        const translatedSegment = this.i18nRouter.getTranslation(currentKey);

        if (translatedSegment)
          batchKey = currentKey;

        translateBatch.push(translatedSegment || segment);
      } else
        translateBatch.push(segment);
    });

    return translateBatch.join('/');
  }
}
