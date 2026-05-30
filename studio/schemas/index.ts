/* Schema registry — exposes every type to sanity.config.ts. */

import bilingualString from './objects/bilingualString'
import bilingualText from './objects/bilingualText'
import bilingualPortable from './objects/bilingualPortable'
import price from './objects/price'
import lucideIcon from './objects/lucideIcon'
import legalSection from './objects/legalSection'
import cookieRow from './objects/cookieRow'

import property from './documents/property'
import teamMember from './documents/teamMember'
import pillar from './documents/pillar'
import legalPage from './documents/legalPage'
import siteContent from './documents/siteContent'
import siteSettings from './documents/siteSettings'
import newsArticle from './documents/newsArticle'
import project from './documents/project'
import ledProduct from './documents/ledProduct'
import ledBillboard from './documents/ledBillboard'

export const schemaTypes = [
    // Object types (used as field references)
    bilingualString,
    bilingualText,
    bilingualPortable,
    price,
    lucideIcon,
    legalSection,
    cookieRow,
    // Documents
    property,
    teamMember,
    pillar,
    legalPage,
    siteContent,
    siteSettings,
    newsArticle,
    project,
    ledProduct,
    ledBillboard,
]
