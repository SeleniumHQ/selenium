/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Scheduler from './Scheduler'
import ClockTimer from './ClockTimer'
import Timeline from './Timeline'

var defaultScheduler = new Scheduler(new ClockTimer(), new Timeline())

export default defaultScheduler
