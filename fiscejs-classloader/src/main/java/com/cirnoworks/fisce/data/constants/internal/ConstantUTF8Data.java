/**
 *  Copyright 2010 Yuxuan Huang. All rights reserved.
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package com.cirnoworks.fisce.data.constants.internal;

import com.cirnoworks.fisce.data.constants.ConstantData;

/**
 * Innter use only
 * 
 * @author cloudee
 */
public class ConstantUTF8Data implements ConstantData {

	private String string;

	public void setString(String string) {
		this.string = string;
	}

	public String getString() {
		return string;
	}

	public String toString() {
		return "ConstantUTF8:" + string;
	}

	public void fillConstants(ConstantData[] constantPool) {
	}
}
