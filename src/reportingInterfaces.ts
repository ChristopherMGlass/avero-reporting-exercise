interface TimeFrame {
    start: string,
    end: string
}
export interface Report {
    timeInterval: string,
    report: string,
    data: ReportEntry[]
}
export
    interface ReportEntry {
    timeFrame: TimeFrame,
}
export
    interface EGSReportEntry extends ReportEntry {
    employee: string
    value: number
}
export
    interface FCPEntry extends ReportEntry {
    value: number
}
export interface LCPEntry extends ReportEntry {
    value: number
}

export enum Interval {
    hour = "hour", day = "day", month = "month"  //Week??
}
enum ReportType {
    LCP, FCP, EGS
}